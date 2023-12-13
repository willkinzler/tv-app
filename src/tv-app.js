// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import "./tv-channel.js";
import '@lrnwebcomponents/video-player/video-player.js';


export class TvApp extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = '';
    this.source = new URL('../assets/channels.json', import.meta.url).href;
    this.listings = [];
    this.activeIndex = 0;
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'tv-app';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      name: { type: String },
      source: { type: String },
      listings: { type: Array },
      activeIndex: { type: Number }
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return [
      css`
      :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px;
          padding: 20px;
        }

        .grid-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
        }

        .left-item {
          margin-top: 20px;
          margin-right: 20px;
          width: 70vw;
          max-width: 600px;
        }

        .right-item {
          width: 80%;
          font-size: 1.5rem;
          color: #333;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin-top: 20px;
          text-align: center;
          overflow-y: auto;
          height: 50vh;
        }

        .tv-data {
          width: 70vw;
          max-width: 600px;
        }

        .description-box {
          padding-top: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .slideclicker {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .previous-slide,
        .next-slide {
          font-size: 18px;
          width: 120px;
          height: 40px;
          background-color: #3498db;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        @media screen and (max-width: 800px) {
          .left-item {
            width: 90vw;
            margin-right: 0;
          }

          .right-item {
            width: 90%;
            height: 40vh;
          }

          .tv-data {
            width: 90vw;
          }

          .slideclicker {
            gap: 40px;
          }

          .previous-slide,
          .next-slide {
            width: 80px;
          }

          .listing {
            height: 100px;
          }
        }

      `
    ];
  }
  // LitElement rendering template of your element
  render() {
    return html`
    <div class="container">
      <div class="grid-item">
        <div class="left-item">
          <video-player source="https://www.youtube.com/watch?v=sXnoQdA6cYM" accent-color="yellow" dark track="https://haxtheweb.org/files/HAXshort.vtt"></video-player>
    </div>
    <tv-channel title="Top 10 Best Video Games of 2023" presenter="WatchMojo.com">
      ${this.listings.length > 0 ? this.listings[this.activeIndex].description : ''}
    </tv-channel>
  </div>
  <div class="right-item">
    <h2>${this.name}</h2>
      ${
        this.listings.map(
          (item) => html`
            <tv-channel 
              title="${item.title}"
              presenter="${item.metadata.author}"
              @click="${this.itemClick}"
              ?active="${index === this.activeIndex}"
              timecode="${item.metadata.timecode}"
              description="${item.description}"
              index="${index}"
              image="${item.metadata.image}"
              
            >
            </tv-channel>
          `
        )
      }
      <div>
        <!-- video -->
        <!-- discord / chat - optional -->
      </div>
      <!-- dialog -->
      <sl-dialog label="Dialog" class="dialog">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <sl-button slot="footer" variant="primary" @click="${this.closeDialog}">Close</sl-button>
      </sl-dialog>

      <div class="slider">
        <button class="previous-slide" @click="${this.previousSlide}">Previous Slide</button>
        <button class="next-slide" @Click="${this.nextSlide}">Next Slide</button>
    </div>
    </div>
    `;
  }

  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  itemClick(e) {
    console.log(e.target);
    const dialog = this.shadowRoot.querySelector('.dialog');
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('ally-media-player').play();
  }

  previousSlide() {
    this.activeIndex = Math.max(0, this.activeIndex - 1);
  }

  nextSlide() {
    this.activeIndex = Math.min(this.listings.length-1, this.activeIndex);
  }

  connectedCallback() {
    super.connectedCallback();

    setInterval(() => {
      const currentTime = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('ally-media-player').media.currentTime;
      if(this.activeIndex + 1 < this.listings.length && currentTime >= this.listings[this.activeIndex + 1].metadata.timecode) {this.activeIndex++;
      }
    })
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
      if(propName === "activeIndex"){
        console.log(this.shadowRoot.querySelectorAll("tv-channel"));
        console.log(this.activeIndex)
        this.activeChannel=this.shadowRoot.querySelector("tv-channel[index = '" + this.activeIndex + "' ] ");
      }
    }, 1000);
  }

  async updateSourceData(source) {
    await fetch(source).then((resp) => resp.ok ? resp.json() : []).then((responseData) => {
      if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
        this.listings = [...responseData.data.items];
      }
    });
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(TvApp.tag, TvApp);
