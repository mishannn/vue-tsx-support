import { mount } from "@vue/test-utils";
import Vue, { VNode } from "vue";
import { Component, Prop } from "vue-property-decorator";
import {
  DefineProps,
  InnerScopedSlots,
  DefineEvents,
  emit
} from "vue-tsx-support";

describe("classComponent", () => {
  @Component
  class Test extends Vue {
    @Prop({ type: String, required: true })
    foo!: string;
    @Prop({ type: String })
    bar?: string;

    _tsx!: DefineProps<Test, "foo" | "bar"> &
      DefineEvents<{ customEvent: string }>;

    $scopedSlots!: InnerScopedSlots<{ default?: string }>;

    emitCustomEvent(arg: string) {
      emit(this, "customEvent", arg);
    }

    render(): VNode {
      const defaultSlot = this.$scopedSlots.default;
      const content = defaultSlot ? defaultSlot(this.foo) : this.foo;
      return <div>{content}</div>;
    }
  }
  describe("create", () => {
    it("render", () => {
      const w = mount(Test, {
        propsData: { foo: "fooValue" },
        scopedSlots: {
          default(prop: string) {
            return <span>{prop}</span>;
          }
        }
      });
      expect(w.html()).toBe("<div><span>fooValue</span></div>");
    });
    it("event should be emitted with name without `on` prefix", () => {
      const w = mount(Test, {
        propsData: { foo: "fooValue" }
      });
      w.vm.emitCustomEvent("emit-test");
      expect(w.emittedByOrder()).toStrictEqual([
        { name: "customEvent", args: ["emit-test"] }
      ]);
    });
  });
});
