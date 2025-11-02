#!/bin/bash

echo "========================================"
echo "FredEggs GitHub Upload Script"
echo "========================================"
echo ""

cd fredeggs

git init
git add .
git commit -m "Initial commit - FredEggs Website"

echo ""
echo "Bitte gib deine GitHub Repository URL ein:"
echo "(z.B. https://github.com/DEINNAME/fredeggs.git)"
read -p "Repository URL: " REPO_URL

git branch -M main
git remote add origin $REPO_URL
git push -u origin main

echo ""
echo "========================================"
echo "Fertig! Dateien wurden hochgeladen."
echo "Jetzt auf Vercel deployen!"
echo "========================================"
