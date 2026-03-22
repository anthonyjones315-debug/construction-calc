#!/bin/bash
cat -n src/app/calculators/_components/CalculatorPage.tsx | grep -B 30 -A 30 'setWallStudHeightMode(nextMode);'
