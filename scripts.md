# Scripts to setup the app in production

## To setup AWS EC2 instance

```bash
sudo apt update
sudo apt upgrade
```

## Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
sudo apt-get install -y nodejs
```

## Setup github token

```bash
ssh-keygen -t ed25519 -C "wenjiao.wang1@gmail.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

add the pub key into `Add SSH key` section in AWS console

```bash
git clone git@github.com:leopardary/memoryhelper.git
```

## Setup caddy

change :80 to your endpoint like simple.memoryhelper.com

```bash
vim /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

## ref link

`https://www.youtube.com/watch?v=nQdyiK7-VlQ&t=711s`
Domain name:
`https://www.youtube.com/watch?v=jDz4j_kkyLA`

## start the app permanently

```bash
pm2 start npm --name nextjs-app -- run start -- -p 3000
```

link: `https://medium.com/@mudasirhaji/deploying-a-next-js-app-manually-on-aws-ec2-a-step-by-step-guide-58b266ff1c52`
