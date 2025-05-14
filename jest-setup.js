// Mock browser environment for tests
class MockElement {
  constructor() {
    this.innerHTML = '';
    this.style = {};
    this.className = '';
    this.classList = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn().mockReturnValue(false)
    };
    this.attributes = {};
    this.children = [];
  }
  
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  
  getAttribute(name) {
    return this.attributes[name];
  }
  
  querySelector(selector) {
    return new MockElement();
  }
  
  querySelectorAll(selector) {
    return [new MockElement()];
  }
  
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100
    };
  }
  
  remove() {
    // Mock remove method
  }
}

// Setup global mocks that might be needed
global.HTMLElement = MockElement;
global.customElements = {
  define: jest.fn()
};

// Mock any other browser APIs that might be needed
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = () => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  });
}

// For element.classList.add/remove
if (!document.createRange) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document
    },
    createContextualFragment: str => {
      const div = document.createElement('div');
      div.innerHTML = str;
      return div.children[0];
    }
  });
}

// For animations
if (!window.performance) {
  window.performance = {
    now: () => Date.now()
  };
} 