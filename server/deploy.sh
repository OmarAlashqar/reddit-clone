#!/bin/bash

if [ -f "./pre-deploy.sh" ]; then
    source ./pre-deploy.sh
fi

if [ "$REMOTE" == "" ] ;then
  echo "Make sure you set the REMOTE environment variable, exiting..."
  exit 1
fi

echo "What version should this deployment be?"
read VERSION

echo "Version ($VERSION), are you sure? [y/N]"
read SURE

if [ "$SURE" == "${SURE#[Yy]}" ] ;then
  echo "Cancelling deployment..."
  exit 1
fi

docker build -t oalashqar/reddit-clone-api:$VERSION .
docker push oalashqar/reddit-clone-api:$VERSION

ssh $REMOTE "docker pull oalashqar/reddit-clone-api:$VERSION && docker tag oalashqar/reddit-clone-api:$VERSION dokku/reddit-clone-api:$VERSION && dokku deploy reddit-clone-api $VERSION"