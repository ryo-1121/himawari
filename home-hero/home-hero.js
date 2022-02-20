function homeHero() {
  const root = document.querySelector('.js-HomeHero')

  // iOS Safari のための 100vh 調整
  const setViewportHeight = () => {
    const ua = window.navigator.userAgent
    const isIOSSafari = /Version\/([0-9\._]+).*Mobile.*Safari.*/.test(ua)
    if (!isIOSSafari) {
      return
    }
    const update = () => {
      const viewportHeight = window.innerHeight
      root.style.setProperty('--js-viewport-height', `${viewportHeight}px`)
    }
    window.addEventListener('orientationchange', () => {
      setTimeout(update, 500)
    })
    update()
  }

  // 最初のひまわりのアニメーションの画像の読み込み完了
  const hasLoadedImages = () => {
    const images = [...root.querySelectorAll('.HomeHeroHeader img, .HomeHeroMap img')]
    const promises = images.map((img) => {
      return img.complete ? Promise.resolve() : new Promise((resolve) => img.addEventListener('load', resolve, { once: true }))
    })
    return Promise.all(promises)
  }

  // 最初のひまわりのアニメーション
  const initialAnimation = () => {
    // 地図のひまわりの位置を設定
    root.querySelectorAll('[data-pos]').forEach((el) => {
      const [left, top] = el.dataset.pos.split(',')
      el.style.setProperty('--left', left)
      el.style.setProperty('--top', top)
    })

    // [data-delay] をフェードイン
    const elems = [...root.querySelectorAll('[data-delay]')]
    const keyframes = { opacity: [0, 1] }
    const duration = 400
    const promises = elems.map((el) => {
      const delay = (el.dataset.delay || 0) * 1000
      const animate = el.animate(keyframes, { duration, delay })
      animate.onfinish = () => {
        el.removeAttribute('data-delay')
      }
      return animate.finished
    })
    return Promise.all(promises)
  }

  // 写真のループアニメーション
  const photoAnimation = () => {
    const wrap = root.querySelector('.HomeHeroPhotos')
    const sm = wrap.querySelector('.HomeHeroPhotos__sm')
    const lg1 = wrap.querySelector('.HomeHeroPhotos__lg1')
    const lg2 = wrap.querySelector('.HomeHeroPhotos__lg2')

    // 足りない分の画像を埋める
    // ループアニメーションのスピードを調整するためにワンユニットのアイテム数を返す
    const fillPhotoItem = (container) => {
      const originalItems = container.querySelectorAll('picture')
      while (container.querySelectorAll('picture').length < 5) {
        originalItems.forEach((el) => {
          container.appendChild(el.cloneNode(true))
        })
      }
      const unitItems = container.querySelectorAll('picture')
      unitItems.forEach((el) => {
        container.appendChild(el.cloneNode(true))
      })
      return unitItems.length
    }
    const smUnitLength = fillPhotoItem(sm)
    const lg1UnitLength = fillPhotoItem(lg1)
    const lg2UnitLength = fillPhotoItem(lg2)

    // 各画像読み込み完了でフェードイン
    wrap.querySelectorAll('img').forEach((img) => {
      const handleLoad = () => {
        img.style.opacity = '1'
      }
      if (img.complete) {
        handleLoad()
      } else {
        img.addEventListener('load', handleLoad, { once: true })
      }
    })

    // 最初の表示アニメーション
    const initialAnimate = () => {
      const fade = [{ opacity: [0, 1] }, { duration: 2000, fill: 'both' }]
      const toBottom = { transform: ['translateY(-50%)', 'translateY(0%)'] }
      const toTop = { transform: ['translateY(50%)', 'translateY(0%)'] }
      const options = {
        duration: 1000,
        easing: 'cubic-bezier(0, 0, 0, 1)',
      }
      return new Promise((resolve) => {
        wrap.animate(...fade)
        sm.animate(toBottom, options).onfinish = resolve
        lg1.animate(toBottom, options).onfinish = resolve
        lg2.animate(toTop, options).onfinish = resolve
      })
    }

    // ループアニメーション
    const loopAnimate = () => {
      const toTop = { transform: ['translateY(0%)', 'translateY(-50%)'] }
      const toBottom = { transform: ['translateY(0%)', 'translateY(50%)'] }
      const getOptions = (itemLength) => ({
        duration: 6000 * itemLength,
        easing: 'linear',
        iterations: Infinity,
      })
      sm.animate(toTop, getOptions(smUnitLength))
      lg1.animate(toTop, getOptions(lg1UnitLength))
      lg2.animate(toBottom, getOptions(lg2UnitLength))
    }

    // アニメーション開始
    initialAnimate().then(loopAnimate)
  }

  const init = async () => {
    setViewportHeight()
    await hasLoadedImages()
    await initialAnimation()
    photoAnimation()
  }

  init()
}
