FROM node:alpine

WORKDIR /app

COPY package*.json ./
COPY entrypoint.sh ./

# Make the script executable
RUN chmod +x entrypoint.sh
RUN npm install 

COPY . .

EXPOSE 3001

CMD [ "npm", "run", "migrate", "&&", "npm", "start" ]
