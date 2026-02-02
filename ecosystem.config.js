module.exports = {
    apps: [
        {
            name: 'kartal-metal',
            script: './index.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 3008
            },
            max_memory_restart: '300M',
            watch: false,
            error_file: './logs/pm2-err.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        }
    ]
};
