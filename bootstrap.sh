#!/usr/bin/env bash

# Update ubuntu
/vagrant/ubuntu.sh

# Install nodejs
/vagrant/nodejs.sh

# Build and install CouchDB from source
/vagrant/couchdb.sh

# Download and install opennlp
/vagrant/opennlp.sh
