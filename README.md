# Real-time Session Invalidation

Companion [blog post](https://updateloop.dev/lets-build-you-have-been-logged-out/)

## Clone & npm install

```
git clone https://github.com/robzhu/logged-out
cd logged-out
npm install
```

## Polling demo

```
npm run polling
# open polling/index.html in two browser tabs
```

## Push demo with Web Sockets

```
npm run push
# open push/index.html in two browser tabs
```

## Push demo with Web Sockets & Redis

For this demo, you'll need a redis instance. Add a `.env` file to the root of the project with the following contents:

```
REDIS_HOST=<Redis HOST IP Address>
```

```
npm run push-redis
# open push-redis/index.html in two browser tabs
```

See the [blog post](https://updateloop.dev/lets-build-you-have-been-logged-out/) for more a more detailed explanation.
