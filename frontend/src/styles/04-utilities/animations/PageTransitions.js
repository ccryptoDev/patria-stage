export const rightFadeIn = {
    animationStates: {
      initial: {
        x: '+30vw'
      },
      in: {
        x: 0,
        transition: {
          type: 'spring',
          bounce: '0.025'
        }
      },
      out: {
        x: '-30vw'
      }
    },
    transitions: {
      default: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      },
      defaultStaggered: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      }
    }
  };
  
  export const rightFadeInSmall = {
    animationStates: {
      initial: {
        x: '+3vw'
      },
      in: {
        x: 0,
        transition: {
          type: 'spring',
          bounce: '0.025'
        }
      },
      out: {
        x: '-3vw'
      }
    },
    transitions: {
      default: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      },
      defaultStaggered: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      }
    }
  };
  
  export const bottomFadeIn = {
    animationStates: {
      initial: {
        opacity: 0,
        y: '+20vh'
      },
      in: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          bounce: '0.025'
        }
      },
      out: {
        opacity: 0,
        y: '-20vh'
      }
    },
    transitions: {
      default: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      },
      defaultStaggered: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      }
    }
  };
  
  export const fade = {
    animationStates: {
      initial: {},
      in: {
        transition: {
          staggerChildren: 0.025
        }
      },
      out: {}
    },
    transitions: {
      default: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      },
      defaultStaggered: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      }
    }
  };
  export const fadeInOut = {
    animationStates: {
      initial: {
        opacity: 0
      },
      in: {
        opacity: 1
      },
      out: {
        opacity: 0
      }
    },
    transitions: {
      default: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      },
      defaultStaggered: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.9]
      }
    }
  };
  