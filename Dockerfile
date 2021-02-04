FROM cypress/base

ADD . /app
WORKDIR /app
RUN npm install
# Make Cypress installer not print thousands of lines of progress bars
ENV CI=1 
RUN npx cypress install

EXPOSE 3000
CMD node server.js