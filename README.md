# @questpie/webapp

This is a monorepo boilerplate used inside QUESTPIE.com projects.


TODO:
[x] Development docker-compose setup
[x] Monorepo Bun setup
[x] Shared internal packages setup
[x] TsConfig setup
[x] Elysia server
[x] Drizzle ORM
[ ] Redis setup
[ ] Websocket 
    [ ] Elysia Websocket - (long running server must be deployed on a non-serverless environment)
        [ ] Horizontal scaling through Redis (optional)  
    [ ] Pusher/Soketi - (serverless environment -> pusher branch)
    [ ] Example
    [ ] Setup
[x] WebApp - Next.js
    [x] App Router
    [x] ShadcnUI - Dark mode - Tailwind
    [] Auth Pages
    [] App Skeleton
    [] Onboarding skeleton
[x] Lucia Auth Setup
    [x] Magic Link
    [X] OAuth example (google)
[] Resend/Nodemailer Setup -> unified provider agnostic email sending interface
[] Payment integration 
    [ ] Stripe (default)
    [ ] LemonSqueezy (optional)
    [ ] Routes
    [ ] Webhooks
    [ ] Checkout
    [ ] Customer sync
[] Docs/Landing - Next.js with cms integration
    [] PayloadCMS ?? or other CMS?
[] Jobs -> implement jobs
    [] BullMQ - separate worker must be deployed on a non-serverless environment (default) -> bull branch
    [] Trigger.dev - serverless environment (optional -> trigger branch)