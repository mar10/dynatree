# Introduction #

The example browser has test cases for standard, almost-standard and quirks mode.


# Test results #
## Strict/standards mode ##

All browsers behave well!


## Loose/transitional mode ##

  * Chrome: OK!
  * Safari: OK!
  * IE9: problems with d'n'd hit area detection (source node highlight and helper is misplaced)
  * IE8: problems with d'n'd hit area detection (source node highlight and helper is misplaced)
  * IE7: OK
  * IE6: OK(!)
  * FF9: Source node highlight Ok, but helper is misplaced.
  * Opera11: FAIL: even mouse clicks are calculated wrong ([issue 229](https://code.google.com/p/dynatree/issues/detail?id=229))


## Quirks mode (no DTD) ##
  * Chrome: OK!
  * Safari: OK!
  * IE9: OK
  * IE8: OK
  * IE7: OK
  * IE6: OK
  * FF9: Source node highlight Ok, but helper is misplaced.
  * Opera11: FAIL: even mouse clicks are calculated wrong ([issue 229](https://code.google.com/p/dynatree/issues/detail?id=229))