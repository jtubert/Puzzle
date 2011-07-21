#!/bin/bash

javac classes/com/rga/AddDisclaimer.java -d classes -classpath ant.jar classes/com/rga/FileListing.java
jar cf AddDisclaimer.jar AddDisclaimer.properties -C classes .