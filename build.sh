echo "building web"
bash build_docker.sh  "$1"
bash npm_install.sh
bash npm_build.sh
