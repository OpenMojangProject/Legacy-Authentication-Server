# Legacy Authentication Server
Welcome to the OpenMojangProject Legacy Authentication Server, a recreation of the [legacy Mojang authentication server](https://wiki.vg/Legacy_Mojang_Authentication). Please note that we are an independent entity and not affiliated with Mojang, Microsoft, or Minecraft in any way.

##### The original server is here: https://authserver.mojang.com

## Purpose
Our primary goal with this project is to preserve and recreate the legacy Mojang authentication server for archival purposes. Additionally, we aim to ensure its functionality to the best of our abilities. You can utilize this server with a genuine Minecraft client by integrating it with the authlib-injector project. To enhance security and support the authlib-injector project's archival efforts, we have forked it and maintain our own repository, which you can access [here](https://github.com/OpenMojangProject/authlib-injector).

## Implementation
***note:*** *joining online mode servers will not work, [learn more](#joining-servers).*
- [x] **Authenticate:** /authenticate
- [x] **Refresh:** /refresh
- [x] **Validate:** /validate
- [x] **Signout:** /signout
- [x] **Invalidate:** /invalidate

## Installation
This installation is assuming that you are running some form of Linux distrubution.

### Prerequisites
- Node.js 16 or higher
### Setup Instructions
1. Clone this project by running this command:
```bash
git clone https://github.com/OpenMojangProject/AuthServer.git
```

2. Duplicate the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```

3. Open the newly created .env file and customize the values to align with your requirements:
```bash
nano .env
```

4. Initiate the legacy Mojang authentication server by executing 
```bash
node index.js
```

## Inject Authlib
*this works with servers too*

Setting up authlib-injector will force Minecraft to use a custom server.

1. Download [authlib-injector](https://github.com/yushijinhun/authlib-injector/releases/latest).
2. Place the .jar file in your `.minecraft` directory.
3. Edit your java arguments and add:
    - `-javaagent:authlib-injector.jar=SRV`
        - Replace SRV with the location of your auth server.

## Joining Servers
Joining servers is currently not implemented in this project. This requires an implemention of the [Protocol Implemention](https://wiki.vg/Protocol_Encryption) introduced in 12w17a. I am unsure on how to implement this into the project, if you know, feel free to contribute using a pull request.
