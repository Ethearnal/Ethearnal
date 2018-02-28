#!/usr/bin/env bash

ssh one@lon02cd "killall -9 python"
ssh one@lon03cd "killall -9 python"
ssh one@lon04cd "killall -9 python"
ssh one@lon01ng "killall -9 python"
ssh one@lon02cd "cd ~/Ethearnal; git pull"
ssh one@lon03cd "cd ~/Ethearnal; git pull"
ssh one@lon04cd "cd ~/Ethearnal; git pull"
ssh one@lon01ng "cd ~/Ethearnal; git pull"
