<template>
  <div class="fade-to-black container mx-auto">
    <div class="columns-1">
      <div class="flex items-center flex-col py-8">
        <code
          class="block whitespace-pre overflow-x-scroll text-white py-4 h-60 overflow-scroll"
        >
          {{ prettyResult || "" }}
        </code>
        <div>
          <button
            class="text-5xl bg-purple-500 hover:bg-purple-700 text-white font-bold py-8 px-12 border border-blue-700 rounded-xl"
            @click="solve"
          >
            Solve
          </button>
        </div>
      </div>
      <div class="h-96 overflow-scroll">
        <prism-editor
          v-model="model"
          class="editor"
          :highlight="highlighter"
          :line-numbers="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as solver from "javascript-lp-solver";

import {PrismEditor} from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";

import Prism, {highlight, languages} from "prismjs/components/prism-core";

import "prismjs/components/prism-json";
import "prismjs/themes/prism-dark.min.css";
import "prismjs/plugins/autolinker/prism-autolinker.min";
import "prismjs/plugins/autolinker/prism-autolinker.css";

Prism.plugins.autolinker.processGrammar(languages.json);

const WGT_LENGTH_IN_DAYS = 4;

const CLOTH_TYPES = {
  shoes: "Shoes",
  trousers: "Pants",
  top: "Top",
  jacket: "Jacket",
};

const clothes = {
  "Black Blizzard Wp, Dr. Martens, Boot": {
    max: WGT_LENGTH_IN_DAYS / 2,
    appeal: 1,
    type: CLOTH_TYPES.shoes,
    url: "https://www.emp.de/p/2976---black-blizzard-wp/524033.html"
  },
  "Rest, Vixxsin, Kapuzenpullover": {
    max: WGT_LENGTH_IN_DAYS / 4,
    appeal: 3,
    type: CLOTH_TYPES.jacket,
    url: "https://www.emp.de/p/rest/234967.html"
  },
  "Ladies Cut-Out Turtleneck Longsleeve, Urban Classics, Langarmshirt": {
    max: WGT_LENGTH_IN_DAYS / 3,
    appeal: 4,
    type: CLOTH_TYPES.top,
    url: "https://www.emp.de/p/ladies-cut-out-turtleneck-longsleeve/504671.html"
  },
  "Emma, Forplay, Langarmshirt": {
    max: WGT_LENGTH_IN_DAYS / 3,
    appeal: 2,
    type: CLOTH_TYPES.top,
    url: "https://www.emp.de/p/emma/533474.html"
  },
  "Smart Hoodie, RED by EMP, Kapuzenpullover": {
    max: WGT_LENGTH_IN_DAYS / 4,
    appeal: 2,
    ype: CLOTH_TYPES.jacket,
    url: "https://www.emp.de/p/smart-hoodie/233169.html"
  },
  "Ladies Faux Leather High Waist Leggings, Urban Classics, Leggings": {
    max: WGT_LENGTH_IN_DAYS / 2,
    appeal: 2,
    type: CLOTH_TYPES.trousers,
    url: "https://www.emp.de/p/ladies-faux-leather-high-waist-leggings/439728.html"
  },
  "Ladies Basic Turtleneck Longsleeve, Urban Classics, Sweatshirt": {
    max: WGT_LENGTH_IN_DAYS / 4,
    appeal: 2,
    type: CLOTH_TYPES.jacket,
    url: "https://www.emp.de/p/ladies-basic-turtleneck-longsleeve/467874.html"
  },
  "Granger Vegan, Altercore, High Heel": {
    max: WGT_LENGTH_IN_DAYS / 2,
    appeal: 2,
    type: CLOTH_TYPES.shoes,
    url: "https://www.emp.de/p/granger-vegan/519156EU38.html"
  },
  "NMCallie HW Skinny Black Jeans, Noisy May, Jeans": {
    max: WGT_LENGTH_IN_DAYS / 2,
    appeal: 1,
    type: CLOTH_TYPES.trousers,
    url: "https://www.emp.de/p/nmcallie-hw-skinny-black-jeans/398828.html"
  },
  "Ladies Light Bomber Jacket, Urban Classics, Übergangsjacke": {
    max: WGT_LENGTH_IN_DAYS / 4,
    appeal: 1,
    type: CLOTH_TYPES.jacket,
    url: "https://www.emp.de/p/ladies-light-bomber-jacket/320676.html"
  },
  "Crest Vintage, Queen, Langarmshirt": {
    max: WGT_LENGTH_IN_DAYS / 3,
    appeal: 1,
    type: CLOTH_TYPES.top,
    url: "https://www.emp.de/p/crest-vintage/388537.html"
  },
};

const outfits = [];

for (let cloth1 of Object.entries(clothes).filter(
    ([key, _]) => !/\d{1,2}\/\//g.test(key)
)) {
  const c = {};
  for (let clothType1 of Object.values(CLOTH_TYPES)) {
    for (let cloth2 of Object.entries(clothes).filter(
        ([key, value]) =>
            !/\d{1,2}\/\//g.test(key) &&
            value.type === clothType1 &&
            key !== cloth1[0]
    )) {
      c[clothType1] = cloth2;
      if (Object.keys(c).length === Object.keys(CLOTH_TYPES).length) {
        outfits.push(Object.assign({}, c));
      }
    }
  }
}

const model = {
  optimize: "appeal",
  opType: "max",
  constraints: clothes,
  variables: outfits
      .map((o, i) => {
        return {
          [o[CLOTH_TYPES.shoes][0]]: 1,
          [o[CLOTH_TYPES.top][0]]: 1,
          [o[CLOTH_TYPES.trousers][0]]: 1,
          [o[CLOTH_TYPES.jacket][0]]: 1,
          appeal: Object.values(o).reduce(
              (agg, value) => agg + clothes[value[0]].appeal,
              0
          ),
        };
      })
      .reduce((agg, value, i) => {
        agg[`outfit${i}`] = value;
        return agg;
      }, {}),
}

export default {
  name: "FadeToBlack",
  components: {
    PrismEditor,
  },
  props: {},
  data: function () {
    return {
      model: JSON.stringify(model, null, 2),
      result: null
    };
  },
  computed: {
    prettyResult() {
      return this.result && JSON.stringify(this.result, null, 2);
    },
  },
  methods: {
    solve() {
      this.result = null;
      try {
        const m = JSON.parse(this.model);
        this.result = solver.Solve(m);
      } catch (e) {
        this.result = e.message;
      }
    },
    highlighter(code) {
      return highlight(
          code,
          languages.json,
          "json"
      );
    },
  },
};
</script>

<style scoped>
.editor {
  background: #2d2d2d;
  color: #ccc;

  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

:deep(.prism-editor__textarea) {
  outline: none;
}

:deep(.prism-editor-wrapper .prism-editor__editor a) {
  pointer-events: visible;
  text-decoration: underline;
}
</style>
