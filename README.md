# Surma

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

# Running Surma locally

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Requirements

- [Node.js](https://nodejs.org/en/download) 
- [npm](https://www.npmjs.com/) (included in Node installation)
- [Postgresql](https://www.postgresql.org/download/) (to use a local database)

## Getting Started

1. Run ```npm i``` to install all dependencies
2. Start the local database
3. Create an .env file (someone from the team can give you the correct values)
4. You can run ```npx prisma db seed``` to seed the database with test data or create data yourself
5. Start the development server with ```npm run dev```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.


