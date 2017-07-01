#!/usr/bin/env bash

apt-get -y install openjdk-9-jre
cd /opt
wget http://apache.mirrors.nublue.co.uk/opennlp/opennlp-1.8.0/apache-opennlp-1.8.0-bin.tar.gz
tar xfvz apache-opennlp-1.8.0-bin.tar.gz
