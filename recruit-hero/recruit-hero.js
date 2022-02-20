function recruitHero({
  // 画像のパス
  images = [
    // { src: 'pathto/image.jpg', alt: 'alt' },
  ],

  // インターバル
  interval = 4000,

  // 切り替えアニメーション in
  animateIn = [
    { opacity: 0, transform: 'scale(1.2)' },
    { opacity: 1, transform: 'scale(1)' },
  ],

  // 切り替えアニメーション out
  animateOut = [
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(1.2)' },
  ],

  // 切り替えアニメーション options
  animateOptions = {
    duration: 1500,
    easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  },

  // 切り替えアニメーション 2つのずれ
  delay = 500,
}) {
  const root = document.querySelector('.js-RecruitHero')
  const container1 = root.querySelector('.RecruitHero__photo1')
  const container2 = root.querySelector('.RecruitHero__photo2')

  let currentIndex = -1

  const wait = (ms) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        if (ms) {
          setTimeout(resolve, ms)
        } else {
          resolve()
        }
      })
    })
  }

  // .RecruitHero__phrase の画像読み込み後
  const hasLoadedPhraseImages = () => {
    return Promise.all(
      [...root.querySelectorAll('.RecruitHero__phrase img')].map((img) => {
        if (img.complete) {
          return Promise.resolve()
        }
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
        })
      })
    )
  }

  // 引数のsrcを読み込み完了したimg要素を返す
  const preLoadImage = ({ src, alt }) => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      const timer = setTimeout(() => {
        resolve(img)
      }, 10000)
      img.addEventListener(
        'load',
        () => {
          clearTimeout(timer)
          resolve(img)
        },
        { once: true }
      )
      img.src = src
      img.alt = alt
    })
  }

  // 画像の切り替えアニメーション
  const switchImage = (container, nextImg) => {
    // すでに表示してる画像
    const currentImg = container.querySelector('img')
    if (currentImg) {
      currentImg.animate(animateOut, animateOptions).onfinish = () => {
        currentImg.remove()
      }
    }
    // これから表示する画像
    container.insertBefore(nextImg, currentImg)
    return nextImg.animate(animateIn, animateOptions).finished
  }

  // 画像切り替えループ
  const next = async () => {
    currentIndex = (currentIndex + 1) % images.length
    const src1 = images[currentIndex]
    const src2 = images[(currentIndex + 1) % images.length]

    const [img1, img2] = await Promise.all([
      // prettier-ignore
      preLoadImage(src1),
      preLoadImage(src2),
      wait(interval),
    ])

    switchImage(container2, img2)
    await wait(delay)
    await switchImage(container1, img1)

    next()
  }

  // 最初のアニメーション
  const initialAnimation = () => {
    const animateElems = [...root.querySelectorAll('[data-animate]')]
    const animatePromises = animateElems.map((el) => {
      console.log(el)
      return new Promise((resolve) => {
        const delay = el.setAttribute('data-animate-start', 'true')
        el.addEventListener(
          'animationend',
          () => {
            el.removeAttribute('data-animate')
            el.removeAttribute('data-animate-start')
            resolve()
          },
          { once: true }
        )
      })
    })
    return Promise.all(animatePromises)
  }

  const initial = async () => {
    currentIndex = (currentIndex + 1) % images.length
    const src1 = images[currentIndex]
    const src2 = images[(currentIndex + 1) % images.length]
    const [img1, img2] = await Promise.all([
      // prettier-ignore
      preLoadImage(src1),
      preLoadImage(src2),
      hasLoadedPhraseImages(),
    ])
    container1.appendChild(img1)
    container2.appendChild(img2)
    await initialAnimation()

    next()
  }

  initial()
}
