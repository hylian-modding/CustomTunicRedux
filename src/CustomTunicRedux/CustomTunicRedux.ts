import { IPlugin, IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { EventHandler } from 'modloader64_api/EventHandler';
import { onViUpdate } from 'modloader64_api/PluginLifecycle';
import { OotEvents, IOOTCore } from 'modloader64_api/OOT/OOTAPI';
import { vec4, rgba } from 'modloader64_api/Sylvain/vec';
import { InjectCore } from 'modloader64_api/CoreInjection';

class rgbaCTR {
    r!: number;
    g!: number;
    b!: number;
    a!: number;

    fromArray(arr: Array<number>): rgbaCTR {
        this.r = arr[0];
        this.g = arr[1];
        this.b = arr[2];
        this.a = 0xFF;
        return this;
    }

    fromVec4(vec: vec4) {
        let v = 1 / 255;
        this.r = vec.x / v;
        this.g = vec.y / v;
        this.b = vec.z / v;
        this.a = vec.w / v;
        return this;
    }
}

function hexToRgb(hex: string): rgbaCTR {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let arr = [parseInt(result![1], 16), parseInt(result![2], 16), parseInt(result![3], 16)]
    return new rgbaCTR().fromArray(arr);
}

function RgbtoHex(vec: vec4): string{
    let v = 1 / 255;
    return "#" + hexPadding2(Math.floor(vec.x / v)) + hexPadding2(Math.floor(vec.y / v)) + hexPadding2(Math.floor(vec.z / v));
}

function hexPadding2(i: number): string {
    return ('00' + i.toString(16)).substr(-2).toUpperCase();
}

interface CustomTunicRedux_Config {
    kokiri: string;
    goron: string;
    zora: string;
    sgauntlets: string;
    ggauntlets: string;
    a_button: string;
    b_button: string;
    c_buttons: string;
    // map: string;
    magic_meter: string;
    // hearts: string;
}

class CustomTunicRedux implements IPlugin {

    ModLoader!: IModLoaderAPI;
    isUpdatingRom: boolean = false;
    lastStatus: boolean = false;
    ready: boolean = true;
    queue: Array<() => void> = [];
    iconBank!: Buffer;
    baseTunic!: Buffer;
    workingBuffer!: Buffer;
    config!: CustomTunicRedux_Config
    // ImGui
    kokiri: vec4 = rgba(0, 0, 0, 0);
    goron: vec4 = rgba(0, 0, 0, 0);
    zora: vec4 = rgba(0, 0, 0, 0);
    sgauntlets: vec4 = rgba(0, 0, 0, 0);
    ggauntlets: vec4 = rgba(0, 0, 0, 0);
    a_button: vec4 = rgba(0, 0, 0, 0);
    b_button: vec4 = rgba(0, 0, 0, 0);
    c_buttons: vec4 = rgba(0, 0, 0, 0);
    // map: vec4 = rgba(0, 0, 0, 0);
    magic_meter: vec4 = rgba(0, 0, 0, 0);
    // hearts: vec4 = rgba(0, 0, 0, 0);
    saveNext: boolean = false;
    @InjectCore()
    core!: IOOTCore;

    preinit(): void {
    }
    init(): void {
        this.config = this.ModLoader.config.registerConfigCategory("CustomTunicRedux") as CustomTunicRedux_Config;
        this.ModLoader.config.setData("CustomTunicRedux", "kokiri", "#1e691b");
        this.ModLoader.config.setData("CustomTunicRedux", "goron", "#641400");
        this.ModLoader.config.setData("CustomTunicRedux", "zora", "#003c64");
        this.ModLoader.config.setData("CustomTunicRedux", "sgauntlets", "#ffffff");
        this.ModLoader.config.setData("CustomTunicRedux", "ggauntlets", "#ffffff");
        this.ModLoader.config.setData("CustomTunicRedux", "a_button", "#5a5aff");
        this.ModLoader.config.setData("CustomTunicRedux", "b_button", "#009600");
        this.ModLoader.config.setData("CustomTunicRedux", "c_buttons", "#ffa000");
        // this.ModLoader.config.setData("CustomTunicRedux", "overworld_map", "#00ffff");
        this.ModLoader.config.setData("CustomTunicRedux", "magic_meter", "#00c800");
        // this.ModLoader.config.setData("CustomTunicRedux", "hearts", "#c80000");
    }
    postinit(): void {
    }
    onTick(frame?: number | undefined): void {
    }

    @EventHandler(OotEvents.ON_SCENE_CHANGE)
    onSceneChange(){
        this.onSave();
        if (this.saveNext){
            this.ModLoader.config.save();
        }
    }

    @onViUpdate()
    onVi() {
        try{
            if (this.ModLoader.ImGui.beginMainMenuBar()) {
                if (this.ModLoader.ImGui.beginMenu("Mods")) {
                    if (this.ModLoader.ImGui.beginMenu("Custom Tunic Redux")) {
                        if (this.ModLoader.ImGui.beginMenu("Kokiri Tunic")){
                            if (this.ModLoader.ImGui.colorPicker4("Kokiri Tunic", this.kokiri, undefined, this.kokiri)) {
                                let a = RgbtoHex(this.kokiri);
                                this.ModLoader.config.setData("CustomTunicRedux", "kokiri", a, true);
                                this.setTunic(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("Goron Tunic")){
                            if (this.ModLoader.ImGui.colorPicker4("Goron Tunic", this.goron, undefined, this.goron)) {
                                let a = RgbtoHex(this.goron);
                                this.ModLoader.config.setData("CustomTunicRedux", "goron", a, true);
                                this.setTunic(a, 1);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("Zora Tunic")){
                            if (this.ModLoader.ImGui.colorPicker4("Zora Tunic", this.zora, undefined, this.zora)) {
                                let a = RgbtoHex(this.zora);
                                this.ModLoader.config.setData("CustomTunicRedux", "zora", a, true);
                                this.setTunic(a, 2);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("Gauntlets")){
                            if (this.ModLoader.ImGui.beginMenu("Silver Gauntlets")){
                            if (this.ModLoader.ImGui.colorPicker4("Silver Gauntlets", this.sgauntlets, undefined, this.sgauntlets)) {
                                let a = RgbtoHex(this.sgauntlets);
                                this.ModLoader.config.setData("CustomTunicRedux", "sgauntlets", a, true);
                                this.setSGauntlet(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("Gold Gauntlets")){
                            if (this.ModLoader.ImGui.colorPicker4("Gold Gauntlets", this.ggauntlets, undefined, this.ggauntlets)) {
                                let a = RgbtoHex(this.ggauntlets);
                                this.ModLoader.config.setData("CustomTunicRedux", "sgauntlets", a, true);
                                this.setGGauntlet(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("A Button")){
                            if (this.ModLoader.ImGui.colorPicker4("A Button", this.a_button, undefined, this.a_button)) {
                                let a = RgbtoHex(this.a_button);
                                this.ModLoader.config.setData("CustomTunicRedux", "a_button", a, true);
                                this.setAButton(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("B Button")){
                            if (this.ModLoader.ImGui.colorPicker4("B Button", this.b_button, undefined, this.b_button)) {
                                let a = RgbtoHex(this.b_button);
                                this.ModLoader.config.setData("CustomTunicRedux", "b_button", a, true);
                                this.setBButton(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        if (this.ModLoader.ImGui.beginMenu("C Buttons")){
                            if (this.ModLoader.ImGui.colorPicker4("C Buttons", this.c_buttons, undefined, this.c_buttons)) {
                                let a = RgbtoHex(this.c_buttons);
                                this.ModLoader.config.setData("CustomTunicRedux", "c_buttons", a, true);
                                this.setCButton(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        // if (this.ModLoader.ImGui.beginMenu("Overworld Map")){
                        //     if (this.ModLoader.ImGui.colorPicker4("Overworld Map", this.map, undefined, this.map)) {
                        //         let a = RgbtoHex(this.map);
                        //         this.ModLoader.config.setData("CustomTunicRedux", "overworld_map", a, true);
                        //         this.setMap(a, 0);
                        //         this.saveNext = true;
                        //     }
                        //     this.ModLoader.ImGui.endMenu();
                        // }
                        if (this.ModLoader.ImGui.beginMenu("Magic Meter")){
                            if (this.ModLoader.ImGui.colorPicker4("Magic Meter", this.magic_meter, undefined, this.magic_meter)) {
                                let a = RgbtoHex(this.magic_meter);
                                this.ModLoader.config.setData("CustomTunicRedux", "magic_meter", a, true);
                                this.setMagic(a, 0);
                                this.saveNext = true;
                            }
                            this.ModLoader.ImGui.endMenu();
                        }
                        // if (this.ModLoader.ImGui.beginMenu("Hearts")){
                        //     if (this.ModLoader.ImGui.colorPicker4("Hearts", this.hearts, undefined, this.hearts)) {
                        //         let a = RgbtoHex(this.hearts);
                        //         this.ModLoader.config.setData("CustomTunicRedux", "hearts", a, true);
                        //         this.setHeart(a, 0);
                        //         this.saveNext = true;
                        //     }
                        //     this.ModLoader.ImGui.endMenu();
                        // }
                        this.ModLoader.ImGui.endMenu();
                    }
                    this.ModLoader.ImGui.endMenu();
                }
                this.ModLoader.ImGui.endMainMenuBar();
            }
        }catch(err){
            console.log(err.stack);
        }
    }

    private setTunic(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x3);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 1);
        k.writeUInt8(rgb.b, 2);
        this.ModLoader.emulator.rdramWriteBuffer(0x800F7AD8 + (index * 0x3), k);
        return rgb;
    }
    private setSGauntlet(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x3);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 1);
        k.writeUInt8(rgb.b, 2);
        this.ModLoader.emulator.rdramWriteBuffer(0x800F7AE4 + ( 0 * 3 ) + (index * 0x3), k);
        return rgb;
    }
    private setGGauntlet(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x3);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 1);
        k.writeUInt8(rgb.b, 2);
        this.ModLoader.emulator.rdramWriteBuffer(0x800F7AE4 + ( 1 * 3 ) + (index * 0x3), k);
        return rgb;
    }
    private setAButton(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x5);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 2);
        k.writeUInt8(rgb.b, 4);
        this.ModLoader.emulator.rdramWriteBuffer(0x801C7951 + (index * 0x5), k);
        return rgb;
    }
    private setBButton(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x5);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 2);
        k.writeUInt8(rgb.b, 4);
        this.ModLoader.emulator.rdramWriteBuffer(0x801C767B + (index * 0x5), k);
        return rgb;
    }
    private setCButton(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x5);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 2);
        k.writeUInt8(rgb.b, 4);
        this.ModLoader.emulator.rdramWriteBuffer(0x801C7673 + (index * 0x5), k);
        return rgb;
    }
    // private setMap(hex: string, index: number) {
    //     let k: Buffer = Buffer.alloc(0x3);
    //     let rgb = hexToRgb(hex);
    //     k.writeUInt8(rgb.r, 0);
    //     k.writeUInt8(rgb.g, 1);
    //     k.writeUInt8(rgb.b, 2);
    //     this.ModLoader.emulator.rdramWriteBuffer(0x801C7DC9 + (index * 0x3), k);
    //     return rgb;
    // }
    private setMagic(hex: string, index: number) {
        let k: Buffer = Buffer.alloc(0x5);
        let rgb = hexToRgb(hex);
        k.writeUInt8(rgb.r, 0);
        k.writeUInt8(rgb.g, 2);
        k.writeUInt8(rgb.b, 4);
        this.ModLoader.emulator.rdramWriteBuffer(0x801C7625 + (index * 0x5), k);
        return rgb;
    }
    // private setHeart(hex: string, index: number) {
    //     let k: Buffer = Buffer.alloc(0x5);
    //     let rgb = hexToRgb(hex);
    //     k.writeUInt8(rgb.r, 0);
    //     k.writeUInt8(rgb.g, 2);
    //     k.writeUInt8(rgb.b, 4);
    //     // this.ModLoader.emulator.rdramWriteBuffer(0x8011BD31 + (index * 0x5), k); //Heartbeat outer
    //     // this.ModLoader.emulator.rdramWriteBuffer(0x8011BD39 + (index * 0x5), k); //Heartbeat inner
    //     // this.ModLoader.emulator.rdramWriteBuffer(0x8011BD41 + (index * 0x5), k); //Heart outer
    //     this.ModLoader.emulator.rdramWriteBuffer(0x8011BD51 + (index * 0x5), k); //Heart inner
    //     return rgb;
    // }

    @EventHandler(OotEvents.ON_SAVE_LOADED)
    onSave() {
        let k = this.setTunic(this.config.kokiri, 0);
        let g = this.setTunic(this.config.goron, 1);
        let z = this.setTunic(this.config.zora, 2);
        let sgaunt = this.setSGauntlet(this.config.sgauntlets, 3);
        let ggaunt = this.setGGauntlet(this.config.ggauntlets, 4);
        let a = this.setAButton(this.config.a_button, 4);
        let b = this.setBButton(this.config.b_button, 5);
        let c = this.setCButton(this.config.c_buttons, 6);
        // let map = this.setMap(this.config.map, 8);
        let magic = this.setMagic(this.config.magic_meter, 7);
        // let heart = this.setHeart(this.config.hearts, 9);
        this.kokiri = rgba(k.r, k.g, k.b, k.a);
        this.goron = rgba(g.r, g.g, g.b, g.a);
        this.zora = rgba(z.r, z.g, z.b, z.a);
        this.sgauntlets = rgba(sgaunt.r, sgaunt.g, sgaunt.b, sgaunt.a);
        this.ggauntlets = rgba(ggaunt.r, ggaunt.g, ggaunt.b, ggaunt.a);
        this.a_button = rgba(a.r, a.g, a.b, a.a);
        this.b_button = rgba(b.r, b.g, b.b, b.a);
        this.c_buttons = rgba(c.r, c.g, c.b, c.a);
        // this.map = rgba(map.r, map.g, map.b, map.a);
        this.magic_meter = rgba(magic.r, magic.g, magic.b, magic.a);
        // this.hearts = rgba(heart.r, heart.g, heart.b, heart.a);
    }

}

module.exports = CustomTunicRedux;