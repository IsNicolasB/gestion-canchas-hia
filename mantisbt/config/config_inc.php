<?php
// Helper: leer la misma variable desde getenv, $_ENV o $_SERVER (no agrega nuevas vars)
function env_var(string $name, $default = null) {
    $v = getenv($name);
    if ($v !== false && $v !== '') {
        return $v;
    }
    if (isset($_ENV[$name]) && $_ENV[$name] !== '') {
        return $_ENV[$name];
    }
    if (isset($_SERVER[$name]) && $_SERVER[$name] !== '') {
        return $_SERVER[$name];
    }
    // Algunos entornos Apache establecen REDIRECT_*
    if (isset($_SERVER['REDIRECT_'.$name]) && $_SERVER['REDIRECT_'.$name] !== '') {
        return $_SERVER['REDIRECT_'.$name];
    }
    return $default;
}

// Configuración de base de datos
$g_hostname               = 'mantis_db';
$g_db_type                = 'pgsql';
$g_database_name          = 'mantis_bt';
$g_db_username            = 'defaultdb_uq64_user';
$g_db_password            = '39EBHhXA30MwMK7rimdltCxjWL8pxdbV';
$g_db_port                = '5432';
$g_db_use_ssl             = false;
$g_installed = true;
// Configuración de la aplicación
$g_crypto_master_salt     = 'aB3$$dE9fG2hI5jK7lM0nP4qR8sT6uV1wX';
$g_default_timezone       = 'America/Argentina/Jujuy';

// Determinar URL pública de la app para enlaces en correos
$env_app_url = env_var('APP_URL');
if ($env_app_url && trim($env_app_url) !== '') {
    $g_path = rtrim($env_app_url, '/') . '/';
} else {
    $g_path = 'http://localhost:8085';
}

$g_short_path             = '';
$g_script_path            = '/';
$g_use_iis                = OFF;
$g_allow_signup           = ON;
$g_enable_email_notification = ON;
$g_phpMailer_method       = PHPMAILER_METHOD_SMTP;

// Configuración de SMTP desde entorno
$g_smtp_host              = env_var('SMTP_HOST');
$g_smtp_port              = (int) env_var('SMTP_PORT', 2525);
$g_smtp_connection_mode   = env_var('SMTP_MODE', 'tls');
$g_smtp_username          = env_var('SMTP_USER');
$g_smtp_password          = env_var('SMTP_PASS');

// Forzar remitente desde entorno (corrige noreply@example.com)
$g_from_email             = env_var('SMTP_FROM', $g_smtp_username);
$g_administrator_email    = $g_from_email;
$g_webmaster_email        = $g_from_email;
$g_return_path_email      = $g_from_email;
$g_from_name              = 'MantisBT';

// Configuración de seguridad
$g_allow_anonymous_login  = OFF;
$g_allow_permanent_cookie = ON;
$g_cookie_samesite        = 'Lax';
$g_cookie_secure_flag     = OFF;  // Cambiar a ON si usas HTTPS

// Configuración de logs
$g_log_level              = LOG_EMAIL | LOG_EMAIL_RECIPIENT | LOG_FILTERING;
$g_log_destination        = '';

// Para forzar la instalación
$g_installed              = true;
$g_default_language       = 'spanish';
$g_fallback_language      = 'spanish';

// Configuración de caché
$g_cache_lifetime         = 600;  // 10 minutos
$g_compress_html          = ON;
$g_show_queries_count     = OFF;
$g_show_timer             = OFF;