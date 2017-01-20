<h1>
<a href="http://hellogrojo.com"><img alt="Grojo logo" src="http://www.hellogrojo.com/images/logo-grojo.png" title="grojo - intelligent gardening"/></a>
</h1>

[![Twitter Follow](https://img.shields.io/twitter/follow/hellogrojo.svg?style=social&maxAge=3600)](https://twitter.com/hellogrojo)


# pi-utils 

A collection of utilities for developing on the Raspberry Pi, including various system/os utilities, gpio functions, and WiFi management.  Tested primarily on RPi3.  

## Documentation &nbsp;
[github](https://github.com/hellogrojo/pi-utils/blob/master/documentation.md)


## Installation &nbsp;
**With [node](http://nodejs.org) [installed](http://nodejs.org/en/download):**
```sh
# Get the latest release of pi-utils
npm install --save pi-utils
```

This library depends on and provides a wrapper to the excellent [rpio](https://github.com/jperkin/node-rpio) library as well, which requires elevated permissions to access gpio functions. In order to run scripts without sudo, try the following:

```sh
# Add user to gpio group
sudo usermod -a -G gpio <username>

# configure udev rules
sudo sh -c 'cat >/etc/udev/rules.d/20-gpiomem.rules <<EOF
SUBSYSTEM=="bcm2835-gpiomem", KERNEL=="gpiomem", GROUP="gpio", MODE="0660"
EOF'

# reboot
sudo reboot
```
 

<br/>
## Support / Issues / Feedback

Need help, have feedback, or need a question answered?  We'd love to hear from you.  Please [email us](mailto:hello@hellogrojo.com).

<br/>
## Links
- [Website](http://hellogrojo.com/)
- [Twitter](https://twitter.com/hellogrojo)
- [Facebook](https://www.facebook.com/hellogrojo)

<br/>
## Team
[Grojo](http://hellogrojo.com) is a small team of engineers and geek gardeners in Maine that are building a community around open source gardening. Our core team consists of:


<img src="http://hellogrojo.com/images/aaron-150x150.jpg" alt="Aaron Hastings" /> |  <img src="http://hellogrojo.com/images/jared-150x150.jpg" alt="Jared Pinkham" /> | <img src="http://hellogrojo.com/images/brandon-150x150.jpg" alt="Brandon Bergman" />
:---:|:---:|:---:
Aaron Hastings | Jared Pinkham | Brandon Bergman 

<br/>
## License
ISC License  Copyright © 2016-2017 grojo, inc.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

Source: http://opensource.org/licenses/ISC