# Surma

(This app is also "Full stack open 2022" course project. You can access the time keeping file [here](https://helsinkifi-my.sharepoint.com/:x:/g/personal/ojaerika_ad_helsinki_fi/ERPWDOW8yHVAsgzaBzjkk6EBDZSPJ36IimR3GOQUNpq1xA?e=Xouabf). The password has been sent to those who need to have access to the file)

Surma (also known as _Murhamaster 3.0_) is an updated and upgraded version of the assassination tournament control app of Helsingin yliopiston salamurhaajat ry. You can read more about the association and the assassination tournaments on our [website](https://salamurhaajat.net).

Surma is created with Next.js/Typescript with a PostgreSQL database.

The app is running [here](https://surma.salamurhaajat.net).

## Registration

To use the app, one needs to register to a tournament first, which is done at `/registration`. Click the name of the tournament you want to register in.

## Logging in and using the user page

After the registration the user needs to log in with the email they have given at the registration phase. The login form is at the root page i.e. at `https://surma.salamurhaajat.net`. Write the email address there and then the login link will be sent to the email. After clicking the link the user is redirected to their user page.

At the user page the user can edit their information (the calendar and other information) that is given to their hunters. From the navigation bar the user finds their targets if the tournament is running.

## Using the admin page

The admin page is at `/admin`

There the umpires can create, edit and remove "murder rings" that determine who is hunting whom.

There is also a list of players. Every player has three states: ALIVE, DEAD and DETECTIVE. An alive player is both a hunter and a target, a dead player is out of the game and a detective is a hunter that can kill other players with some extra rules (the more detailed explanation of player states is found [here](https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot)).

By clicking the name of the player, you get to the player's user page where the umpire sees the player's data and also when they have last visited their profile.

# Running the Project locally

_Follow the instructions given by **Next.js**:_

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
