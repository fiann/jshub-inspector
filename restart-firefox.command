# Restart Firefox so that we can see updates to the extension
osascript -e 'tell application "Firefox" to quit'
/Applications/Firefox.app/Contents/MacOS/firefox-bin -chromebug -no-remote -P 'Plugin Test' &