
# ElderPass

Run for development use:

```console
npm run-script run-dev
```

Generate automatic documentation:

```console
npm run-script document
```

Run for production use (utilize [pm2 for clustering](https://pm2.keymetrics.io/docs/usage/cluster-mode/)):

```console
npm run-script run-prod
```

Gracefully shut down the production server:

```console
npm run-script stop-prod
```

-------

## Folder overview

`logs` - Logs from bunyan & morgan

`public` - All client side CSS & JS

`src` - All server side JS

`views` - All of the [EJS](https://ejs.co) that generates the client side pages

