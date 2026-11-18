import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformMarkdownFigures } from '../src/utils/markdownFigure.ts';

test('keeps the existing caption|align syntax', () => {
  assert.equal(
    transformMarkdownFigures('![A cat|right](https://x.test/cat.png)'),
    '<figure class="figure--right"><img src="https://x.test/cat.png" alt="A cat" /><figcaption>A cat</figcaption></figure>'
  );
});

test('centres by default', () => {
  assert.match(
    transformMarkdownFigures('![A cat](https://x.test/cat.png)'),
    /^<figure class="figure--center">/
  );
});

test('reads #left, #right and #center on the URL as the alignment and drops the hint', () => {
  for (const align of ['left', 'right', 'center']) {
    assert.equal(
      transformMarkdownFigures(`![A cat](https://x.test/cat.png#${align})`),
      `<figure class="figure--${align}"><img src="https://x.test/cat.png" alt="A cat" /><figcaption>A cat</figcaption></figure>`
    );
  }
});

test('an explicit |align wins over the URL hint', () => {
  assert.match(
    transformMarkdownFigures('![A cat|left](https://x.test/cat.png#right)'),
    /^<figure class="figure--left"><img src="https:\/\/x.test\/cat.png"/
  );
});

test('leaves other URL fragments alone', () => {
  assert.match(
    transformMarkdownFigures('![A cat](https://x.test/cat.png#section)'),
    /src="https:\/\/x.test\/cat.png#section"/
  );
});

test('a file name used as alt text is not a caption', () => {
  assert.equal(
    transformMarkdownFigures('![licklider.png](https://x.test/licklider.png#right)'),
    '<figure class="figure--right"><img src="https://x.test/licklider.png" alt="" /></figure>'
  );
  assert.equal(
    transformMarkdownFigures('![IMG_0042.JPEG](https://x.test/a.jpeg)'),
    '<figure class="figure--center"><img src="https://x.test/a.jpeg" alt="" /></figure>'
  );
});

test('a caption that merely mentions a file type still shows', () => {
  assert.match(
    transformMarkdownFigures('![Exporting to PNG](https://x.test/a.png)'),
    /<figcaption>Exporting to PNG<\/figcaption>/
  );
});
