FROM ubuntu:22.04

RUN apt-get update && yes | apt-get install docker unzip
RUN yes | apt-get install ca-certificates curl gnupg lsb-release
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN yes | apt-get update
RUN yes | apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

ENV NODE_VERSION=14.x
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | bash -
RUN apt-get install -y nodejs

WORKDIR /usr/src/sam

ENV SAM_VERSION=v1.52.0
ENV SAM_CLI_TELEMETRY=0

RUN curl -LO https://github.com/aws/aws-sam-cli/releases/download/$SAM_VERSION/aws-sam-cli-linux-x86_64.zip
RUN sha256sum aws-sam-cli-linux-x86_64.zip
RUN unzip aws-sam-cli-linux-x86_64.zip -d sam
RUN ./sam/install

WORKDIR /usr/src/app

COPY . .

RUN sam build
