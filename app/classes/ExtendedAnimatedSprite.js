import * as PIXI from 'pixi.js';

export default class ExtendedAnimatedSprite extends PIXI.extras.AnimatedSprite {
	update(deltaTime)
    {
		if (!this.sequence) {
            super.update(deltaTime);
            return
        }

        const elapsed = this.animationSpeed * deltaTime;
        const previousFrame = this.currentFrame;
        if (this._durations !== null)
        {
            let lag = this._currentTime % 1 * this._durations[this.currentFrame];
            lag += elapsed / 60 * 1000;
            while (lag < 0)
            {
                this._currentTime--;
                lag += this._durations[this.currentFrame];
            }
            const sign = Math.sign(this.animationSpeed * deltaTime);
            this._currentTime = Math.floor(this._currentTime);
            while (lag >= this._durations[this.currentFrame])
            {
                lag -= this._durations[this.currentFrame] * sign;
                this._currentTime += sign;
            }
            this._currentTime += lag / this._durations[this.currentFrame];
        }
        else
        {
            this._currentTime += elapsed;
        }
        if (this._currentTime < 0 && !this.loop)
        {
            this.gotoAndStop(this.sequence[0]);
            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (this._currentTime >= this.sequence.length && !this.loop)
        {
            this.gotoAndStop(this.sequence[this.sequence.length - 1]);
            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (previousFrame !== this.currentFrame)
        {
            if (this.loop && this.onLoop)
            {
                if (this.animationSpeed > 0 && this.currentFrame < previousFrame)
                {
                    this.onLoop();
                }
                else if (this.animationSpeed < 0 && this.currentFrame > previousFrame)
                {
                    this.onLoop();
                }
            }
            this.updateTexture();
        }
    }

    get currentFrame()
    {
		if (!this.sequence)
			return super.currentFrame;

		var currentSequenceFrame = Math.floor(this._currentTime) % this.sequence.length;
		let currentFrame = this.sequence[currentSequenceFrame];
        if (currentFrame < 0)
        {
            currentFrame += this._textures.length;
        }
        return currentFrame;
    }

	set sequence(sequence) {
		this._sequence = sequence;
		this.updateTexture();
	}

	get sequence() {
		return this._sequence;
	}

	set sequenceName(sequenceName) {
        if (this.sequenceName !== sequenceName) {
            this._sequenceName = sequenceName;
            this.sequence = this.sequences[sequenceName];
        }
	}

	get sequenceName() {
		return this._sequenceName;
	}
}