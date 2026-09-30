$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envFile = Join-Path $projectRoot '.env'
if (-not (Test-Path -LiteralPath $envFile)) {
    throw 'Falta .env en la raíz del proyecto.'
}

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
    if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
        $pair = $_ -split '=', 2
        $settings[$pair[0]] = $pair[1]
    }
}
foreach ($name in @('POSTGRES_USER', 'POSTGRES_PASSWORD', 'JWT_SECRET')) {
    if ([string]::IsNullOrWhiteSpace($settings[$name])) {
        throw "Falta $name en .env."
    }
}

$lookup = "SELECT 1 FROM pg_database WHERE datname = 'agrocloud_test';"
$existing = $lookup | docker exec -i agrocloud-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -tA'
if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar agrocloud-db.' }
if ($existing -notcontains '1') {
    docker exec agrocloud-db sh -c 'createdb -U "$POSTGRES_USER" agrocloud_test'
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear agrocloud_test.' }
}

$names = @('RUN_DB_INTEGRATION_TESTS', 'DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET')
$previous = @{}
foreach ($name in $names) {
    $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
    $env:RUN_DB_INTEGRATION_TESTS = 'true'
    $env:DB_URL = 'jdbc:postgresql://agrocloud-db:5432/agrocloud_test'
    $env:DB_USERNAME = $settings['POSTGRES_USER']
    $env:DB_PASSWORD = $settings['POSTGRES_PASSWORD']
    $env:JWT_SECRET = $settings['JWT_SECRET']

    docker run --rm --network agrocloud-net `
        --mount "type=bind,source=$PSScriptRoot,target=/workspace" `
        --mount 'type=volume,source=agrocloud-maven-test-cache,target=/root/.m2' `
        -w /workspace `
        -e RUN_DB_INTEGRATION_TESTS -e DB_URL -e DB_USERNAME -e DB_PASSWORD -e JWT_SECRET `
        maven:3.9.9-eclipse-temurin-24 mvn -B -q test
    if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas de integración.' }
    Write-Output 'Pruebas de integración completadas en agrocloud_test.'
} finally {
    foreach ($name in $names) {
        [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process')
    }
}
