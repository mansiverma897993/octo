module.exports = {
  apps: [
    {
      name: 'mdc-backend',
      cwd: './backend',
      script: 'src/index.js',
      env_file: './backend/.env'
    },
    {
      name: 'mdc-local-agent',
      cwd: './local-agent',
      script: 'src/index.js',
      env_file: './local-agent/.env'
    }
  ]
};
