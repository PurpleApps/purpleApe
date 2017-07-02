#!/usr/bin/env bash

  SPLIT_NUM=$(cat $1 | grep -n "Conclusion$" | sed 's/:.*//g')
  if [ ! $SPLIT_NUM ]; then
    SPLIT_NUM=$(cat $1 | grep -n "Conclusions$" | sed 's/:.*//g');
  fi
  if [ ! $SPLIT_NUM ]; then
    SPLIT_NUM=$(cat $1 | grep -n "Disposal$" | sed 's/:.*//g');
  fi
  if [ ! $SPLIT_NUM ]; then
    SPLIT_NUM=$(cat $1 | grep -n "Discussion and Conclusions$" | sed 's/:.*//g');
  fi
  if [ ! $SPLIT_NUM ]; then
    SPLIT_NUM=$(cat $1 | grep -n "Discussion$" | sed 's/:.*//g');
  fi
  LEN=$(wc -l $1 | sed 's/ .*//g')
  if [ $SPLIT_NUM ]; then
    SPLIT_NUM_B=$(($LEN-$SPLIT_NUM))
    CON_FN=$(echo $1 | sed 's/[.]txt/_conclusion.txt/g')
    tail -n $SPLIT_NUM_B $1 > $CON_FN
  fi
  SUM_NUM=$(cat $1 | grep -n "SUMMARY$" | sed 's/:.*//g')
  if [ ! $SUM_NUM ]; then
    SUM_NUM=$(cat $1 | grep -n "HIS HONOUR" | sed 's/:.*//g')
  fi
  if [ ! $SUM_NUM ]; then
    SUM_NUM=$(cat $1 | grep -n "THE HONOURABLE" | sed 's/:.*//g')
  fi
  if [ $SUM_NUM ]; then
    SUM_NUM_B=$(($LEN-$SUM_NUM))
    SUM_FN=$(echo $1 | sed 's/[.]txt/_summary.txt/g')
    tail -n $SUM_NUM_B $1 > $SUM_FN
  fi
