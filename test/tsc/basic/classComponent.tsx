import Vue, { VNode } from "vue";
import { Component, Prop } from "vue-property-decorator";
import {
  InnerScopedSlots,
  DeclareOn,
  DeclareOnEvents,
  TsxTypeInfoOf,
  emit,
  emitOn,
  PickProps,
  DeclareProps,
  PickOwnProps,
  MakeOptional,
  AutoProps
} from "vue-tsx-support";

@Component
class Test extends Vue {
  _tsx!: DeclareProps<MakeOptional<PickProps<Test, "foo" | "bar" | "baz">, "baz">> &
    DeclareOn<{ e1: string; e2: (p1: string, p2: number) => void }> &
    DeclareOnEvents<{ onE1: string; onE2: (p1: string, p2: number) => void }>;

  @Prop(String) foo!: string;
  @Prop(Number) bar?: number;
  @Prop({ type: String, default: "defaultValue" })
  baz!: string;

  bra!: number;

  $scopedSlots!: InnerScopedSlots<{
    default: { ssprops: string };
    optional?: string;
  }>;

  emitEvents() {
    emit(this, "e1", "value");
    emit(this, "e1", 1); //// TS2345: not assignable

    emit(this, "e2", "value", 1);
    emit(this, "e2", "value"); //// TS2554: Expected 4 arguments
  }

  emitOnEvents() {
    emitOn(this, "onE1", "value");
    emitOn(this, "onE1", 1); //// TS2345: not assignable

    emitOn(this, "onE2", "value", 1);
    emitOn(this, "onE2", "value"); //// TS2554: Expected 4 arguments
  }
}

class Test2 extends Test {
  piyo!: string[];
  _tsx!: TsxTypeInfoOf<Test> &
    DeclareProps<PickOwnProps<Test2, Test, "piyo">> &
    DeclareOn<{ e3: () => void }>;
  $scopedSlots!: Test["$scopedSlots"] &
    InnerScopedSlots<{ additional: { foo: string; bar: number } }>;

  emitEvents2() {
    emit(this, "e1", "value");
    emit(this, "e1", 1); //// TS2345: not assignable

    emit(this, "e2", "value", 1);
    emit(this, "e2", "value"); //// TS2554: Expected 4 arguments

    emit(this, "e3");
    emit(this, "e3", "value"); //// TS2554: Expected 2 arguments
  }
}

// OK
<Test foo="value" />;
// OK
<Test foo="value" bar={1} />;
// OK
<Test foo="value" bar={1} baz="value" />;
// OK
<Test foo="value" on={{}} />;
// OK
<Test
  foo="value"
  on={{
    e1: p => console.log(p.toLocaleLowerCase()),
    e2: (p1, p2) => console.log(p1.toLocaleLowerCase(), p2.toFixed())
  }}
/>;
// NG
<Test foo="value" bar={1} bra={1} />; //// TS2322 | TS2339 | TS2769: 'bra' does not exist
// NG
<Test />; //// TS2322 | TS2326 | TS2769: 'foo' is missing

// NG
// prettier-ignore
<Test
  foo="value"
  on={{ e1: (p: number) => console.log(p) }} //// TS2322 | TS2326 | TS2769
/>;

// OK
<Test
  foo="value"
  on={{
    "!e1": (p: string) => console.log(p)
  }}
/>;

<Test
  foo="value"
  scopedSlots={{
    default: props => props.ssprops
  }}
/>;

<Test
  foo="value"
  scopedSlots={{
    default: props => props.ssprops,
    optional: props => props.toUpperCase()
  }}
/>;

// prettier-ignore
<Test
  foo="value"
  scopedSlots={{ //// TS2322 | TS2326 | TS2741 | TS2769: 'default' is missing
    optional: props => props.toUpperCase()
  }}
/>;

// OK
<Test2 foo="value" piyo={["foo"]} />;
// OK
<Test2 foo="value" bar={1} piyo={["foo"]} />;
// OK
<Test2
  foo="value"
  piyo={[]}
  on={{
    e1: p => console.log(p.toLocaleLowerCase()),
    e2: () => console.log("baz")
  }}
/>;
// OK
<Test2
  foo="value"
  piyo={[]}
  on={{
    e1: [p => console.log(p.toLocaleLowerCase())]
  }}
/>;

// NG
<Test2 piyo={["foo"]} />; //// TS2322 | TS2326 | TS2769: 'foo' is missing
// OK
<Test2
  foo="value"
  bar={1}
  piyo={["foo"]}
  scopedSlots={{
    default: props => props.ssprops,
    additional: props => `${props.foo} ${props.bar}`
  }}
/>;

@Component
class GenericTest<T> extends Vue {
  _tsx!: DeclareProps<PickProps<GenericTest<T>, "foo" | "bar">>;

  @Prop() foo!: T;
  @Prop(Function) bar!: (value: T) => string;

  $scopedSlots!: InnerScopedSlots<{
    default: { item: T };
    optional?: string;
  }>;
}

@Component
class GenericParent<T> extends Vue {
  value!: T;
  bar(value: T): string {
    return "";
  }
  render(): VNode {
    const GenericTestT = GenericTest as new () => GenericTest<T>;
    return (
      <GenericTestT
        foo={this.value}
        bar={this.bar}
        scopedSlots={{
          default: props => <div>{this.bar(props.item)}</div>
        }}
      />
    );
  }
}

@Component
class Test3 extends Vue {
  _tsx!: DeclareProps<Omit<AutoProps<Test3, Vue>, "bra" | "test">>;

  @Prop(String) foo!: string;
  @Prop(Number) bar?: number;

  bra!: number;

  test() {}
}

// OK
<Test3 foo="fooValue" />;
// OK
<Test3 foo="fooValue" bar={1} />;
// NG
<Test3 bar={1} />; //// TS2322 | TS2769: 'foo' is missing
// OK
<Test3 foo="fooValue" bra={1} />; //// TS2322 | TS2769: 'bra' does not exist
