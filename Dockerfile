FROM smclaughlin/centos

RUN mkdir -p /usr/local/resume
VOLUME /usr/local/resume
WORKDIR /usr/local/resume

RUN yum -y install node npm

# Centos requires inherits to be installed.
# http://stackoverflow.com/questions/20435793/unable-to-install-hubot-npm-dependency-not-met
RUN npm install -g inherits 

# Installing miller-rabin fixes another bug.
# http://stackoverflow.com/questions/27743105/cannot-run-npm-install-browserify
RUN npm install miller-rabin@1.1.1 --save-peer 

# Global node modules
RUN npm install -g browserify \
    && npm install -g watchify

EXPOSE 8080
CMD node app.js
