#!/usr/bin/env bash

ssh one@lon02cd "killall -9 python"
ssh one@lon03cd "killall -9 python"
ssh one@lon04cd "killall -9 python"