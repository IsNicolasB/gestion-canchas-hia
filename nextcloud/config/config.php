<?php
$CONFIG = array(
    'htaccess.RewriteBase' => '/',
    'memcache.local' => '\\OC\\Memcache\\APCu',
    'apps_paths' => array(
        0 => array(
            'path' => '/var/www/html/apps',
            'url' => '/apps',
            'writable' => false,
        ),
        1 => array(
            'path' => '/var/www/html/custom_apps',
            'url' => '/custom_apps',
            'writable' => true,
        ),
    ),
    'upgrade.disable-web' => true,
    'passwordsalt' => 'YX8NsoR8TlYH+NeNeatH9ZkXxyXhVnV',
    'secret' => 'MZixnh3SMQETRrWm8sFR7A6nCMgzH3D5UOpMJmzbKcL',
    'trusted_domains' => array(
        0 => 'localhost',
        1 => 'cloud.canchas-hia-nextcloud.com',
    ),
    'datadirectory' => '/var/www/html/data',
    'dbtype' => 'pgsql',
    'version' => '28.0.0.11',
    'overwrite.cli.url' => 'https://cloud.canchas-hia-nextcloud.com',
    'dbname' => 'nextcloud',
    'dbhost' => 'nextcloud_db',
    'dbport' => '',
    'dbtableprefix' => 'oc_',
    'mysql.utf8mb4' => true,
    'installed' => true,
    'instanceid' => 'oc05tt4bu2m0',
);
