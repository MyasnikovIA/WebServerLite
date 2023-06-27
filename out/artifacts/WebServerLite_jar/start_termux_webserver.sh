# Запуск JavaServer
$PREFIX/share/bin/java -jar /data/data/com.termux/files/home/WebServerLite_jar/WebServerLite.jar /data/data/com.termux/files/home/WebServerLite_jar/config.ini

# https://github.com/MyasnikovIA/Termux-Java-8
# git clone https://github.com/MyasnikovIA/Termux-Java-8.git

# OpenJDK-8 архитектура ARM64
# dpkg --print-architecture  # определить архитектуру  устройства
# wget -q --show-progress -c https://github.com/Hax4us/java/releases/download/v8/jdk8_aarch64.tar.gz -O jdk8_aarch64.tar.gz
# wget -q --show-progress -c https://github.com/MyasnikovIA/Termux-Java-8/blob/main/jdk8_aarch64.tar.gz?raw=true -O jdk8_aarch64.tar.gz
# tar -xf jdk8_aarch64.tar.gz -C $PREFIX/share
# chmod +x $PREFIX/share/bin/*
# $PREFIX/share/bin/java -version
