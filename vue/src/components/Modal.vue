<template>
  <transition v-if="showModal" name="modal">
    <div class="vue-modal-mask">
      <div class="vue-modal-wrapper">
        <div :class="{ 'vue-modal-container': true, 'vue-modal-container-full-height': !fitContent }">
          <div :class="{ 'vue-modal-content': true, 'vue-modal-content-full-height': !fitContent }">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    showModal: {
      required: true,
      type: Boolean
    },
    fitContent: {
      required: false,
      type: Boolean,
      default: false
    }
  }
};
</script>
<style scoped>
.vue-modal-mask {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.vue-modal-container {
  position: absolute;

  width: calc(100% - 20px);
  max-width: 800px;

  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;

  padding: 20px 20px 20px 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.vue-modal-container-full-height {
  height: calc(100% - 20px);
}

.vue-modal-content {
  overflow-x: hidden;
  position: relative;
}

.vue-modal-content-full-height {
  height: 100%;
  overflow-y: scroll;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
