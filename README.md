# Legacy Authentication Server
Welcome to the OpenMojangProject Legacy Authentication Server, a recreation of the [legacy Mojang authentication server](https://wiki.vg/Legacy_Mojang_Authentication). Please note that we are an independent entity and not affiliated with Mojang, Microsoft, or Minecraft in any way.

##### The original server is here: https://authserver.mojang.com

## Purpose
Our primary goal with this project is to preserve and recreate the legacy Mojang authentication server for archival purposes. Additionally, we aim to ensure its functionality to the best of our abilities. You can utilize this server with a genuine Minecraft client by integrating it with the authlib-injector project. To enhance security and support the authlib-injector project's archival efforts, we have forked it and maintain our own repository, which you can access [here](https://github.com/OpenMojangProject/authlib-injector).

## Installation
### Prerequisites
- Node.js 16 or higher
### Setup Instructions
1. Clone this project by running this command: `git clone https://github.com/OpenMojangProject/AuthServer.git`.
2. Duplicate the `.env.example` file and rename it to `.env`, Linux: `cp .env.example .env`.
3. Open the newly created .env file and customize the values to align with your requirements.
4. Initiate the legacy Mojang authentication server by executing `node index.js`.

## Setup Authlib Support
