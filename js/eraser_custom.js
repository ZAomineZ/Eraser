((exports) => {
    const { document } = exports;
    const hastouch = 'ontouchstart' in exports;
    const tapstart = hastouch ? 'touchstart' : 'mousedown';
    const tapmove = hastouch ? 'touchmove' : 'mousemove';
    const tapend = hastouch ? 'touchend' : 'mouseup';

    let x1, y1, x2, y2;

    const options_type = {
        tap_start_x1: 400,
        tap_start_y1: 30,
        tap_move_x2: 900,
        tap_move_y2: 25
    };

    class Eraser {
        constructor(canvas, imgUrl, options = options_type) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.imgUrl = imgUrl;
            this.timer = null;
            this.lineWidth = 55;
            this.gap = 10;
            this.options = options;
        }

        init(args) {
            Object.assign(this, args);
            const img = new Image();

            this.canvasWidth = this.canvas.width = Math.min(document.body.offsetWidth, 640);
            img.crossOrigin = "*";
            img.onload = () => {
                this.canvasHeight = (this.canvasWidth * img.height) / img.width;
                this.canvas.height = this.canvasHeight;
                this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
                this.initEvent();
            };
            img.src = this.imgUrl;
        }

        initEvent() {
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.globalCompositeOperation = 'destination-out';

            this.tapMoveHandler = this.onTapMove.bind(this);
            this.tapStartHandler = this.onTapStart.bind(this);
            this.tapEndHandler = this.onTapEnd.bind(this);

            this.tapStartHandler();
            this.tapEndHandler();
        }

        onTapStart() {
            x1 = this.options.tap_start_x1 - this.canvas.offsetLeft;
            y1 = this.options.tap_start_y1 - this.canvas.offsetTop;

            this.ctx.beginPath();
            this.ctx.arc(x1, y1, 1, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();

            this.tapMoveHandler();
        }

        onTapMove() {
            if (!this.timer) {
                this.timer = setTimeout(() => {
                    x2 = this.options.tap_move_x2 - this.canvas.offsetLeft;
                    y2 = this.options.tap_move_y2 - this.canvas.offsetTop;

                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();

                    x1 = x2;
                    y1 = y2;
                    this.timer = null;
                }, 40);
            }
        }

        onTapEnd() {
            let count = 0;
            const imgData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

            for (let x = 0; x < imgData.width; x += this.gap) {
                for (let y = 0; y < imgData.height; y += this.gap) {
                    const i = (y * imgData.width + x) * 4;
                    if (imgData.data[i + 3] > 0) {
                        count++;
                    }
                }
            }

            if (count / (imgData.width * imgData.height / (this.gap ** 2)) < 0.6) {
                setTimeout(() => {
                    this.removeEvent();
                    document.body.removeChild(this.canvas);
                    this.canvas = null;
                }, 40);
            } else {
                this.tapMoveHandler();
            }
        }

        removeEvent() {
            this.tapStartHandler();
            this.tapEndHandler();
            this.tapMoveHandler();
        }
    }

    exports.Eraser = Eraser;
})(window);