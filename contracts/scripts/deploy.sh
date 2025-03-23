export $(grep -v '^#' .env | xargs -d '\n')
export $(grep -v '^#' .env-secret | xargs -d '\n')

forge --version
if [ $? != 0 ]; then
    export PATH="$PATH:~/.foundry/bin"
    forge --version
    if [ $? != 0 ]; then
        echo "forge is not installed, please install first"
        exit 2
    fi
fi

if [[ $RPC_URL == "" ]]; then
    echo "set RPC_URL in .env file before use this program"
    exit 3
fi

if [[ $PRIVATE_KEY == "" ]]; then
    echo "set PRIVATE_KEY in .env-secret file before use this program"
    exit 4
fi

set -e

output=$(forge create RevealVerifier.sol:Groth16revealVerifier \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy | tee /dev/tty)
echo $output

revealAddress=$(echo "$output" | grep "Deployed to:"  | awk -F ': ' '{print $2}')

echo $revealAddress

forge create Game.sol:Game \
    --constructor-args $revealAddress 1 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy
