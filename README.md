# Legacy Authentication Server

Welcome to the OpenMojangProject Legacy Authentication Server, a recreation of the [legacy Mojang authentication server](https://wiki.vg/Legacy_Mojang_Authentication). Please note that we are an independent entity and not affiliated with Mojang, Microsoft, or Minecraft in any way.

##### The original server is here: https://authserver.mojang.com (now dead)

## Purpose

Our primary goal with this project is to preserve and recreate the legacy Mojang authentication server for archival purposes. Additionally, we aim to ensure its functionality to the best of our abilities. You can utilize this server with a genuine Minecraft client by integrating it with the authlib-injector project. To enhance security and support the authlib-injector project's archival efforts, we have forked it and maintain our own repository, which you can access [here](https://github.com/OpenMojangProject/authlib-injector).

## Implementation

**_note:_** _joining online mode servers will not work, [learn more](#joining-servers)._

_all routes are prefixed with /api, e.g: /api/authenticate_

- [x] **Authenticate:** /authenticate
- [x] **Refresh:** /refresh
- [x] **Validate:** /validate
- [x] **Signout:** /signout
- [x] **Invalidate:** /invalidate

## Installation

This installation is assuming that you are running some form of Linux distribution.

### Prerequisites

- Bun
- PostgreSQL

### Setup Instructions

1. Clone this project by running this command:

```bash
git clone https://github.com/OpenMojangProject/Legacy-Authentication-Server.git
```

2. Install Bun dependencies:

```bash
bun i
```

3. Duplicate the `.env.example` file and rename it to `.env`:

```bash
cp .env.example .env
```

4. Open the newly created .env file and customize the values to align with your requirements:

```bash
nano .env
```

5. Create the database using the Drizzle commands:

```bash
bun run db:migrate
bun run db:generate
```

6. Initiate the legacy Mojang authentication server by executing:

```bash
bun --bun run start
```

_NOTE: The --bun flag is required for password hashing to work._

## Try it out

I have created and exported an Insomnia environment with every request in it (excluding skins and web routes). Download Insomnia [here](https://insomnia.rest/download) and import it by downloading the JSON file [here](https://raw.githubusercontent.com/OpenMojangProject/Legacy-Authentication-Server/main/insomnia.json) (CTRL+S to save the file).

## Inject Authlib

_this works with servers too_

Setting up authlib-injector will force Minecraft to use a custom server.

1. Download [authlib-injector](https://github.com/yushijinhun/authlib-injector/releases/latest).
2. Place the .jar file in your `.minecraft` directory.
3. Edit your java arguments and add:

- `-javaagent:authlib-injector.jar=SRV`
  - Replace SRV with the location of your auth server.

## Joining Servers

Joining servers is currently not implemented in this project. This requires an implementation of the [Protocol Implementation](https://wiki.vg/Protocol_Encryption) introduced in 12w17a. I am unsure of how to implement this into the project; if you know, feel free to contribute using a pull request.
