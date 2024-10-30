# Credentials
## EC2 Credentials Mac


1. Download ```team-3-openssh.pem``` file,
2. Open an SSH client.

3. Locate your private key file. The key used to launch this instance is ```team-3-openssh.pem```

4. Run this command, if necessary, to ensure your key is not publicly viewable. ```chmod 400 "team-3-openssh.pem"```

5. Connect to your instance using its Public DNS:
```ssh -i "team-3-openssh.pem" ubuntu@ec2-3-76-41-200.eu-central-1.compute.amazonaws.com```

## EC2 Credentials Windows
1. Using PuTTYgen converted the *.pem file to *.ppk
2. Connecting to the public DNS of the instance and provided the *.ppk file.
3. Use ubuntu as the user
   <br><br>**DNS**: ```ec2-3-76-41-200.eu-central-1.compute.amazonaws.com```
## Nginx Setup Guide
[How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04)
## Database
**url:** ```jdbc:mysql://gdsd.clau0k8881i1.eu-central-1.rds.amazonaws.com:3306/```
<br>**username:** ```admin```
<br>**password:** ```gdsd_3_smhaz```
<br>**database:** ```gdsd```
## Manual deployment
Steps to deploy manually:
1. ```ssh into the server```
2. ```cd ~gdsd```
3. ```git pull origin main```
4. ```pm2 restart gdsd```