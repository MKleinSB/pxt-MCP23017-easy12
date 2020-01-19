/**
 * MCP23017-Interfacefunktionen für 12 LEDs
 * für eine kommende Erweiterung für den Makerbit und den Calliope Mini
 */
// Basierend auf der tollen Grundlagenseite 
// http://robert-fromm.info/?post=elec_i2c_calliope
// (cc) Creative Commons Robert Fromm 2017
// setLED und Makecode / pxt-Paket (cc) 19.01.2020  M. Klein v1.1

const enum State {
    //% block="On"
    High = 1,
    //% block="Off"
    Low = 0
}

const enum REG_MCP {
    //% Bitmuster um Register A zu beschreiben
    Bitmuster_A = 0x12,
    //% Bitmuster um Register B zu beschreiben
    Bitmuster_B = 0x13,
    //% Aus- / Eingaberichtung des Registers A
    EinOderAusgabe_A = 0x00,
    //% Aus- / Eingaberichtung des Registers B
    EinOderAusgabe_B = 0x01,
    //% Pullup Widerstände Register A
    PullUp_Widerstaende_A = 0x0C,
    //% Pullup Widerstände Register B
    PullUp_Widerstaende_B = 0x0D
}

const enum ADDRESS {
    //% block=0x20
    A20 = 0x20,               // Standardwert
    //% block=0x21
    A21 = 0x21,
    //% block=0x22
    A22 = 0x22,
    //% block=0x23
    A23 = 0x23,
    //% block=0x24
    A24 = 0x24,
    //% block=0x25
    A25 = 0x25,
    //% block=0x26
    A26 = 0x26,
    //% block=0x27
    A27 = 0x27
}
const enum BITS {
    //% block=11111111
    Alle = 0xff,
    //% block=00000000
    keiner = 0x00,
    //% block=00000001
    Bit1 = 0x01
}

// zum Speichern der Bitwerte aus RegisterA und RegisterB

let BitwertA = 0;
let BitwertB = 0;

//% color=#0fbc11 icon="\uf2db"
//% groups="['On Start','LEDs']"

namespace MCP23017 {

    /**
     * Sets the Registers of the MCP23017 to write 
     * and the pull-ups to high
     */
    //% blockId="initMCP23017LED"
    //% block="initialise MCP23017 for 12 LEDs"
    //% weight=100
    //% group="On Start"
    export function initMCP23017LED(): void {
        // Alle Register auf Ausgabe stellen
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_A, MCP23017.bitwert(BITS.keiner))
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_B, MCP23017.bitwert(BITS.keiner))
        // Pullup-Widerstände für saubere Signalübertragung ein!
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_A, MCP23017.bitwert(BITS.Alle))
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_B, MCP23017.bitwert(BITS.Alle))
    }

    /**
     * Schaltet alle LEDs an oder aus.
     * MCP23017 muss vorher für LEDs programmiert sein.
     * @param level digital pin level, either 0 or 1
     */
    //% blockId="setLeds"
    //% block="turn all LEDs %zustand"
    //% weight=87
    //% group="LEDs"
    export function setLeds(zustand: State): void {
        for (let i = 1; i <= 12; i++) {
            setLed(i, zustand);
        }
    }

    /**
     * Schaltet die LEDs wie ein Balken-/Säulendiagramm
     * MCP23017 muss vorher für LEDs programmiert sein.
     * @param von: Wert der auf den 12 LEDs dargestellt werden soll
     * @param bis: Maximalwert (bei Analogwert i.d.R. 1023)
     */
    //% blockId="plotBarGraph"
    //% block="plot bar graph of %von| up to %bis" blockExternalInputs=true
    //% weight=86
    //% group="LEDs"
    export function plotBarGraph(von: number, bis: number): void {
        let ledZahl = 0
        setLeds(State.Low) // LED ausschalten
        if (von > bis || bis == 0) {
            return;
            ledZahl = pins.map(
                von,
                0,
                bis,
                0,
                11
            )
            for (let index = 0; index < ledZahl; index++) {
                setLed(index, State.High);
            }
        }
    }

    /**
     * Schaltet eine LED an oder aus. 
     * MCP23017 muss vorher für LEDs programmiert sein.
     * @param name name of the pin in the range from 1 to 16, eg: 1
     * @param zustand state, either ON or OFF
     */
    //% blockId="setLed"
    //% block="turn LED %name | %zustand"
    //% name.min=1 name.max=12
    //% weight=88
    //% group="LEDs"

    export function setLed(name: number, zustand: State): void {
        if (name < 1 || name > 16) {
            return;
        }
        if (zustand == State.High) { //LEDs an
            if (name > 0 && name < 7) { // Register A
                // Bitweises oder
                BitwertA = BitwertA | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
            } else { // Register B
                name = name - 6
                BitwertB = BitwertB | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
            }
        } else { //   LEDs aus
            if (name > 0 && name < 7) { // Register A
                // Ist das betreffende Bit gesetzt? Dann löschen
                if ((BitwertA & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    // Bitweises XOR ^
                    BitwertA = BitwertA ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
                }
            } else { // Register B
                name = name - 6
                if ((BitwertB & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    // Bitweises XOR ^
                    BitwertB = BitwertB ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
                }
            }
        }

    }

    /**
     * Schreibt in ein Register einen bestimmten Bitwert
     * addr: Adresse des MCP23017 (Standard 0x20)
     * reg: Register
     * value: Bitmuster als Dezimalzahl
     */
    export function writeRegister(addr: ADDRESS, reg: REG_MCP, value: number) {
        pins.i2cWriteNumber(addr, reg * 256 + value, NumberFormat.UInt16BE)
    }

    /**
     * Bitwert für  alle Ein- bzw. Ausgänge zum auswählen
     */
    export function bitwert(alle: BITS): number {
        return alle
    }
}