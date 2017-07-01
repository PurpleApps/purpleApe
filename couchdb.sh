#!/usr/bin/env bash

apt-get --no-install-recommends -y install \
    build-essential pkg-config erlang \
    libicu-dev libmozjs185-dev libcurl4-openssl-dev

# Install CouchDB 2.0
cd /usr/src
wget http://www-eu.apache.org/dist/couchdb/source/2.0.0/apache-couchdb-2.0.0.tar.gz
tar xfz apache-couchdb-2.0.0.tar.gz
cd apache-couchdb-2.0.0
./configure
make release

# Create couchdb User
adduser --system \
        --shell /bin/bash \
        --group --gecos \
        "CouchDB Administrator" couchdb

# Copy binaries to user's directory
cp -R ./rel/couchdb /home/couchdb

# Change the owernship
chown -R couchdb:couchdb /home/couchdb/couchdb

# Change the permission of the CouchDB directories
find /home/couchdb/couchdb -type d -exec chmod 0770 {} \;

# Update the permissions of ini files
chmod 0644 /home/couchdb/couchdb/etc/*

# Enable CouchDB to listen on any host
sed -i "s/;bind_address = 127.0.0.1/bind_address = 0.0.0.0/g" /home/couchdb/couchdb/etc/local.ini

# Configure CouchDB to run as a service via systemd
cp /vagrant/couchdb2.service /etc/systemd/system/couchdb2.service
systemctl start couchdb2
systemctl enable couchdb2

# Sleep to allow time for database to start
sleep 10

# Single node setup
curl -X PUT http://127.0.0.1:5984/_users
curl -X PUT http://127.0.0.1:5984/_replicator
curl -X PUT http://127.0.0.1:5984/_global_changes

# Enable CORS
npm install -g add-cors-to-couchdb
add-cors-to-couchdb
