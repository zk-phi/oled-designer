function intToHex (int) {
    var str = int.toString(16);
    return str.length < 2 ? "0x0" + str : "0x" + str;
}

function bytesToMatrix (bytes) {
    return bytes.map(function (byte) {
        for (var arr = [], i = 0; i < 8; i++, byte = Math.floor(byte / 2)) {
            arr.push(byte % 2);
        }
        return arr;
    });
}

function matrixToBytes (matrix) {
    return matrix.map(function (array) {
        return array.slice(0).reverse().reduce(function (l, r) { return l * 2 + r; });
    });
}

function readFile (file, handler) {
    var reader = new FileReader();
    reader.onload = function (x) { handler(x.target.result); };
    reader.readAsText(file, "UTF-8");
}

var vm = new Vue({
    el: "#app",
    data: {
        glyphs: [],
        glcdfontPrefix: "",
        glcdfontSuffix: "",
        hoverredGlyph: null,
        selectedGlyph: null,
        scenes: []
    },
    methods: {
        hoverGlyph: function (ix) {
            vm.hoverredGlyph = ix;
        },
        selectGlyph: function (ix) {
            vm.selectedGlyph = ix;
        },
        clickGlyphCell: function (x, y) {
            vm.$set(vm.glyphs[vm.selectedGlyph][x], y, vm.glyphs[vm.selectedGlyph][x][y] ? 0 : 1);
        },
        loadGlyph: function (e) {
            readFile(e.target.files[0], function (str) {
                var contents = str.split(/{\n|\n}/);
                vm.glcdfontPrefix = contents[0] + "{\n";
                vm.glcdfontSuffix = "\n}" + contents[2];
                vm.glyphs = contents[1].split("\n").map(function (char) {
                    return bytesToMatrix(
                        char.split(/, *0x/).map(function (byte) { return parseInt(byte, 16); })
                    );
                });
            });
        },
        saveGlyph: function () {
            var str = vm.glyphs.map(function (glyph) {
                return matrixToBytes(glyph).map(intToHex).join(", ");
            }).join(",\n");
            open(URL.createObjectURL(new Blob([ vm.glcdfontPrefix + str + vm.glcdfontSuffix ])));
        },
        loadScenes: function (e) {
            readFile(e.target.files[0], function (str) {
                vm.scenes = str.split(/{{\n|\n0\n}}/)[1].split(/\n0\n}, *{\n/).map(function (scene) {
                    return scene.split("\n").map(function (row) {
                        return row.split(", 0x").map(function (char) { return parseInt(char, 16); });
                    });
                });
            });
        },
        saveScenes: function () {
            var str = vm.scenes.map(function (scene) {
                return scene.map(function (row) {
                    return row.map(intToHex).join(", ");
                }).join(",\n") + ",\n0";
            }).join("\n}, {\n");
            open(URL.createObjectURL(new Blob(["char scenes[][] = {{\n" + str + "\n}};\n"])));
        },
        addScene: function () {
            vm.scenes.push([
                [ 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20 ],
                [ 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20 ],
                [ 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20 ],
                [ 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20 ]
            ]);
        },
        putGlyph: function (ix, x, y) {
            if (vm.selectedGlyph != null) {
                vm.$set(vm.scenes[ix][y], x, vm.selectedGlyph);
            }
        }
    }
});
