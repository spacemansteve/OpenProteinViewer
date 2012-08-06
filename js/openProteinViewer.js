//The creation and type-checking code for the first level
if(typeof tuftsViewer === 'undefined'){
	tuftsViewer = {};
}else if(typeof tuftsViewer !== 'object'){
	throw new Error("tuftsViewer already exists and is not a object!");
}

//Define the tufts viewer alignment class
//id0 and id1 are instances' name of GLmol
TuftsViewer = function(id0, id1){
	this.glmol0 = new GLmol(id0,true);  //the first instance of GLmol class
	this.glmol1 = new GLmol(id1,true);  //the sencond instance of GLmol class
	this.protein0 = ""; //the name of a protein
	this.protein1 = ""; //the name of another protein
	this.sequence0 = ""; //the aminoAcids sequence of protein0
	this.sequence1 = ""; //the aminoAcids sequence of protein1
	this.alignedSequence0 = [];
	this.alignedSequence1 = [];
	//protein resins talbe
	this.ResnTable = {ALA: 'A', CYS: 'C', ASP: 'D', GLU: 'E', PHE: 'F', GLY: 'G', HIS: 'H', ILE: 'I', LYS: 'K', LEU: 'L', MET: 'M', ASN: 'N', PRO: 'P', GLN: 'Q', ARG: 'R', SER: 'S', THR: 'T', VAL: 'V', TRP: 'W', TYR: 'Y', 'HOH': 'O'};
	this.saveAtomsColor0 = []; //save the orignal color of highlighted atoms of the first protein in html page
	this.saveAtomsColor1 = []; //save the orignal color of highlighted atoms of the sencond protein in html page
	this.mouseClicked = false; //the variable control of UI
	this.imgIndex = -1;//the variable control high lighting aminoacid sequence
} 

//Couple the mouse events of two 3D canvas
//The mouse events code is from GLmol.js
//mol0 and mol1 are instances of GLmol
TuftsViewer.prototype.dualMouseActions = function(mol0, mol1){
	var me0 = mol0, glDOM0 = $(mol0.renderer.domElement); 
	var me1 = mol1, glDOM1 = $(mol1.renderer.domElement);
   
	glDOM0.bind('mousedown touchstart', function(ev){
		ev.preventDefault();
		if (!me0.scene) return;
		if(!me1.scene) return;
		var x = ev.pageX, y = ev.pageY;
		if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
			x = ev.originalEvent.targetTouches[0].pageX;
			y = ev.originalEvent.targetTouches[0].pageY;
		}
		if (x == undefined) return;
		me0.isDragging = true;
		me0.mouseButton = ev.which;
		me0.mouseStartX = x;
		me0.mouseStartY = y;
		me0.cq = me0.rotationGroup.quaternion;
		me0.cz = me0.rotationGroup.position.z;
		me0.currentModelPos = me0.modelGroup.position.clone();
		me0.cslabNear = me0.slabNear;
		me0.cslabFar = me0.slabFar;
		me1.isDragging = true;
		me1.mouseButton = ev.which;
		me1.mouseStartX = x;
		me1.mouseStartY = y;
		me1.cq = me1.rotationGroup.quaternion;
		me1.cz = me1.rotationGroup.position.z;
		me1.currentModelPos = me1.modelGroup.position.clone();
		me1.cslabNear = me1.slabNear;
		me1.cslabFar = me1.slabFar;
	});
	
	
	glDOM1.bind('mousedown touchstart', function(ev) {
		ev.preventDefault();
		if (!me1.scene) return;
		if(!me0.scene) return;
		var x = ev.pageX, y = ev.pageY;
		if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
			x = ev.originalEvent.targetTouches[0].pageX;
			y = ev.originalEvent.targetTouches[0].pageY;
		}
		if (x == undefined) return;
		me1.isDragging = true;
		me1.mouseButton = ev.which;
		me1.mouseStartX = x;
		me1.mouseStartY = y;
		me1.cq = me1.rotationGroup.quaternion;
		me1.cz = me1.rotationGroup.position.z;
		me1.currentModelPos = me1.modelGroup.position.clone();
		me1.cslabNear = me1.slabNear;
		me1.cslabFar = me1.slabFar;
		me0.isDragging = true;
		me0.mouseButton = ev.which;
		me0.mouseStartX = x;
		me0.mouseStartY = y;
		me0.cq = me0.rotationGroup.quaternion;
		me0.cz = me0.rotationGroup.position.z;
		me0.currentModelPos = me0.modelGroup.position.clone();
		me0.cslabNear = me0.slabNear;
		me0.cslabFar = me0.slabFar;
	});
	
	glDOM0.bind('mousemove touchmove', function(ev) { // touchmove
		ev.preventDefault();
		if (!me0.scene) return;
		if (!me1.scene) return;
		if (!me0.isDragging) return;
		var mode = 0;
		var modeRadio = $('input[name=' + me0.id + '_mouseMode]:checked');
		if (modeRadio.length > 0) mode = parseInt(modeRadio.val());

		var x = ev.pageX, y = ev.pageY;
		if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
			x = ev.originalEvent.targetTouches[0].pageX;
			y = ev.originalEvent.targetTouches[0].pageY;
		}
		if (x == undefined) return;
		var dx = (x - me0.mouseStartX) / me0.WIDTH;
		var dy = (y - me0.mouseStartY) / me0.HEIGHT;
		var r = Math.sqrt(dx * dx + dy * dy);
		if (mode == 3 || (me0.mouseButton == 3 && ev.ctrlKey)) { // Slab
			me0.slabNear = me0.cslabNear + dx * 100;
			me0.slabFar = me0.cslabFar + dy * 100;
		} else if (mode == 2 || me0.mouseButton == 3 || ev.shiftKey) { // Zoom
			var scaleFactor = (me0.rotationGroup.position.z - me0.CAMERA_Z) * 0.85; 
			if (scaleFactor < 80) scaleFactor = 80;
			me0.rotationGroup.position.z = me0.cz - dy * scaleFactor;
		} else if (mode == 1 || me0.mouseButton == 2 || ev.ctrlKey) { // Translate
			var scaleFactor = (me0.rotationGroup.position.z - me0.CAMERA_Z) * 0.85;
			if (scaleFactor < 20) scaleFactor = 20;
			var translationByScreen = new TV3(- dx * scaleFactor, - dy * scaleFactor, 0);
			var q = me0.rotationGroup.quaternion;
			var qinv = new THREE.Quaternion(q.x, q.y, q.z, q.w).inverse().normalize(); 
			var translation = qinv.multiplyVector3(translationByScreen);
			me0.modelGroup.position.x = me0.currentModelPos.x + translation.x;
			me0.modelGroup.position.y = me0.currentModelPos.y + translation.y;
			me0.modelGroup.position.z = me0.currentModelPos.z + translation.z;
		} else if ((mode == 0 || me0.mouseButton == 1) && r != 0) { // Rotate
			var rs = Math.sin(r * Math.PI) / r;
			me0.dq.x = Math.cos(r * Math.PI); 
			me0.dq.y = 0;
			me0.dq.z =  rs * dx; 
			me0.dq.w =  rs * dy;
			me0.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0); 
			me0.rotationGroup.quaternion.multiplySelf(me0.dq);
			me0.rotationGroup.quaternion.multiplySelf(me0.cq);
			me1.dq.x = Math.cos(r * Math.PI); 
			me1.dq.y = 0;
			me1.dq.z =  rs * dx; 
			me1.dq.w =  rs * dy;
			me1.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0); 
			me1.rotationGroup.quaternion.multiplySelf(me1.dq);
			me1.rotationGroup.quaternion.multiplySelf(me1.cq);
		}
		me0.show();
		me1.show();
	});
	
	glDOM1.bind('mousemove touchmove', function(ev) { // touchmove
      ev.preventDefault();
      if (!me1.scene) return;
	  if (!me0.scene) return;
      if (!me1.isDragging) return;
      var mode = 0;
      var modeRadio = $('input[name=' + me1.id + '_mouseMode]:checked');
      if (modeRadio.length > 0) mode = parseInt(modeRadio.val());

      var x = ev.pageX, y = ev.pageY;
      if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
         x = ev.originalEvent.targetTouches[0].pageX;
         y = ev.originalEvent.targetTouches[0].pageY;
      }
      if (x == undefined) return;
      var dx = (x - me1.mouseStartX) / me1.WIDTH;
      var dy = (y - me1.mouseStartY) / me1.HEIGHT;
      var r = Math.sqrt(dx * dx + dy * dy);
      if (mode == 3 || (me1.mouseButton == 3 && ev.ctrlKey)) { // Slab
          me1.slabNear = me1.cslabNear + dx * 100;
          me1.slabFar = me1.cslabFar + dy * 100;
      } else if (mode == 2 || me1.mouseButton == 3 || ev.shiftKey) { // Zoom
         var scaleFactor = (me1.rotationGroup.position.z - me1.CAMERA_Z) * 0.85; 
         if (scaleFactor < 80) scaleFactor = 80;
         me1.rotationGroup.position.z = me1.cz - dy * scaleFactor;
      } else if (mode == 1 || me1.mouseButton == 2 || ev.ctrlKey) { // Translate
         var scaleFactor = (me1.rotationGroup.position.z - me1.CAMERA_Z) * 0.85;
         if (scaleFactor < 20) scaleFactor = 20;
         var translationByScreen = new TV3(- dx * scaleFactor, - dy * scaleFactor, 0);
         var q = me1.rotationGroup.quaternion;
         var qinv = new THREE.Quaternion(q.x, q.y, q.z, q.w).inverse().normalize(); 
         var translation = qinv.multiplyVector3(translationByScreen);
         me1.modelGroup.position.x = me1.currentModelPos.x + translation.x;
         me1.modelGroup.position.y = me1.currentModelPos.y + translation.y;
         me1.modelGroup.position.z = me1.currentModelPos.z + translation.z;
      } else if ((mode == 0 || me1.mouseButton == 1) && r != 0) { // Rotate
         var rs = Math.sin(r * Math.PI) / r;
         me1.dq.x = Math.cos(r * Math.PI); 
         me1.dq.y = 0;
         me1.dq.z =  rs * dx; 
         me1.dq.w =  rs * dy;
         me1.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0); 
         me1.rotationGroup.quaternion.multiplySelf(me1.dq);
         me1.rotationGroup.quaternion.multiplySelf(me1.cq);
		 me0.dq.x = Math.cos(r * Math.PI); 
         me0.dq.y = 0;
         me0.dq.z =  rs * dx; 
         me0.dq.w =  rs * dy;
         me0.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0); 
         me0.rotationGroup.quaternion.multiplySelf(me0.dq);
         me0.rotationGroup.quaternion.multiplySelf(me0.cq);
      }
      me1.show();
	  me0.show();
   });
	
	glDOM0.bind('DOMMouseScroll mousewheel', function(ev) { // Zoom
		ev.preventDefault();
		if (!me0.scene) return;
		var scaleFactor0 = (me0.rotationGroup.position.z - me0.CAMERA_Z) * 0.85;
		var scaleFactor1 = (me1.rotationGroup.position.z - me1.CAMERA_Z) * 0.85;
		if (ev.originalEvent.detail) { // Webkit
			me0.rotationGroup.position.z += scaleFactor0 * ev.originalEvent.detail / 10;
			me1.rotationGroup.position.z += scaleFactor1 * ev.originalEvent.detail / 10;
		} else if (ev.originalEvent.wheelDelta) { // Firefox
			me0.rotationGroup.position.z -= scaleFactor0 * ev.originalEvent.wheelDelta / 400;
			me1.rotationGroup.position.z -= scaleFactor1 * ev.originalEvent.wheelDelta / 400;
		}
		console.log(ev.originalEvent.wheelDelta, ev.originalEvent.detail, me0.rotationGroup.position.z);
		console.log(ev.originalEvent.wheelDelta, ev.originalEvent.detail, me1.rotationGroup.position.z);
		me0.show();
		me1.show();
	});
	
	glDOM1.bind('DOMMouseScroll mousewheel', function(ev) { // Zoom
		ev.preventDefault();
		if (!me1.scene) return;
		var scaleFactor0 = (me0.rotationGroup.position.z - me0.CAMERA_Z) * 0.85;
		var scaleFactor1 = (me1.rotationGroup.position.z - me1.CAMERA_Z) * 0.85;
		if (ev.originalEvent.detail) { // Webkit
			me0.rotationGroup.position.z += scaleFactor0 * ev.originalEvent.detail / 10;
			me1.rotationGroup.position.z += scaleFactor1 * ev.originalEvent.detail / 10;
		} else if (ev.originalEvent.wheelDelta) { // Firefox
			me0.rotationGroup.position.z -= scaleFactor0 * ev.originalEvent.wheelDelta / 400;
			me1.rotationGroup.position.z -= scaleFactor1 * ev.originalEvent.wheelDelta / 400;
		}
		console.log(ev.originalEvent.wheelDelta, ev.originalEvent.detail, me0.rotationGroup.position.z);
		console.log(ev.originalEvent.wheelDelta, ev.originalEvent.detail, me1.rotationGroup.position.z);
		me0.show();
		me1.show();
	});
	
	glDOM0.bind("contextmenu", function(ev) {ev.preventDefault();});
	$('body').bind('mouseup touchend', function(ev) {
		me0.isDragging = false;
		me1.isDragging = false;
	});
	
	glDOM1.bind("contextmenu", function(ev) {ev.preventDefault();});
	$('body').bind('mouseup touchend', function(ev) {
		me0.isDragging = false;
		me1.isDragging = false;
	});
};

//load the 3D model and the sequence of a protien
TuftsViewer.prototype.loadMolecule = function(molecule) {
	molecule.loadMolecule();	
	$('#' + molecule.id + '_seq').jqDock('destroy');
	$('#' + molecule.id + '_seq').empty();
	var string="";
	//if both sequence are exist
	if(typeof this.glmol0.atoms !== "undefined" && typeof this.glmol1.atoms !== "undefined"){
		//if( molecule.id == "glmol0" ){
		if(molecule.id == this.glmol0.id){
			//if one sequence is normal aminoacid sequence loaded from a PDB file and another is a sequence with dash
			if( this.alignedSequence1.length > 0){
				var aminoAcidSequence0 = this.getAminoAcidSequence(this.glmol0);
				var aminoAcidSequence1 = this.alignedSequence1;
				var len0 = aminoAcidSequence0.length;
				for(var i = 0; i <len0; i++){
					//both are regular aminoacid molecule
					if(typeof aminoAcidSequence1[i] !== 'undefined' && aminoAcidSequence1[i] !== null){
						currentResidues0 = aminoAcidSequence0[i].residues;
						resn0 = aminoAcidSequence0[i].resn;
						currentResidues1 = aminoAcidSequence1[i].residues;
						string += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
					}
					//one is a regular aminoacid molecule and another is a dash
					else{
						currentResidues = aminoAcidSequence0[i].residues;
						resn = aminoAcidSequence0[i].resn;
						string += '<img src="letters/'+resn.toLowerCase()+'.png" title="'+resn.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+molecule.id+',['+currentResidues.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+molecule.id+',['+currentResidues.join(',')+']);">';
					}
				}
			}
			//both are normal aminoacid sequence loaded from PDB files
			else{
				var aminoAcidSequence0 = this.getAminoAcidSequence(this.glmol0);
				var aminoAcidSequence1 = this.getAminoAcidSequence(this.glmol1);
				$('#' + this.glmol1.id + '_seq').jqDock('destroy');
				$('#' + this.glmol1.id + '_seq').empty();
			
				var len0 = aminoAcidSequence0.length;
				var len1 = aminoAcidSequence1.length;
				var len = 0;
				if( len0 >= len1 ){
					len = len0;
				}else{
					len = len1;
				}
				var string1 = "";
				for(var i = 0; i<len; i++){
					if( typeof aminoAcidSequence1[i] !== 'undefined' && aminoAcidSequence1[i] !== null ){
						currentResidues1 = aminoAcidSequence1[i].residues;
						resn1 = aminoAcidSequence1[i].resn;
						if(typeof aminoAcidSequence0[i] !== 'undefined' && aminoAcidSequence0[i] !== null){
							currentResidues0 = aminoAcidSequence0[i].residues;
							resn0 = aminoAcidSequence0[i].resn;
							string1 += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
						else{
							string1 += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
					}
					if(typeof aminoAcidSequence0[i] !== 'undefined' && aminoAcidSequence0[i] !== null){
						currentResidues0 = aminoAcidSequence0[i].residues;
						resn0 = aminoAcidSequence0[i].resn;
						if( typeof aminoAcidSequence1[i] !== 'undefined' && aminoAcidSequence1[i] !== null ){
							currentResidues1 = aminoAcidSequence1[i].residues;
							resn1 = aminoAcidSequence1[i].resn;
							string += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
						else{
							string += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']);">';
						}
					}
				}
				$('#' + this.glmol1.id + '_seq').html(string1);
				$('#' + this.glmol1.id + '_seq').jqDock('destroy');
				$('#' + this.glmol1.id + '_seq').jqDock({size:10, sizeMax:65, distance:20});
			}
		}
		if( molecule.id == this.glmol1.id){
		//if( molecule.id == "glmol1"){
			//if one sequence is normal aminoacid sequence loaded from a PDB file and another is a sequence with dash
			if( this.alignedSequence0.length > 0){
				var aminoAcidSequence0 = this.alignedSequence0;
				var aminoAcidSequence1 = this.getAminoAcidSequence(this.glmol1);
				var len1 = aminoAcidSequence1.length;
				for(var i = 0; i <len1; i++){
					//both are regular aminoacid molecule
					if(typeof aminoAcidSequence0[i] !== 'undefined' && aminoAcidSequence0[i] !== null){
						currentResidues0 = aminoAcidSequence0[i].residues;
						currentResidues1 = aminoAcidSequence1[i].residues;
						resn1 = aminoAcidSequence1[i].resn;
						string += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
					}
					//one is a regular aminoacid molecule and another is a dash
					else{
						currentResidues = aminoAcidSequence1[i].residues;
						resn = aminoAcidSequence1[i].resn;
						string += '<img src="letters/'+resn.toLowerCase()+'.png" title="'+resn.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+molecule.id+',['+currentResidues.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+molecule.id+',['+currentResidues.join(',')+']);">';
					}
				}
			}
			//both are normal aminoacid sequence loaded from PDB files
			else{
				var aminoAcidSequence0 = this.getAminoAcidSequence(this.glmol0);
				var aminoAcidSequence1 = this.getAminoAcidSequence(this.glmol1);
				
				$('#' + this.glmol0.id + '_seq').jqDock('destroy');
				$('#' + this.glmol0.id + '_seq').empty();
			
				var len0 = aminoAcidSequence0.length;
				var len1 = aminoAcidSequence1.length;
				var len = 0;
				if( len0 >= len1 ){
					len = len0;
				}else{
					len = len1;
				}
				var string0 = "";
				for(var i = 0; i<len; i++){
					if( typeof aminoAcidSequence1[i] !== 'undefined' && aminoAcidSequence1[i] !== null ){
						currentResidues1 = aminoAcidSequence1[i].residues;
						resn1 = aminoAcidSequence1[i].resn;
						if(typeof aminoAcidSequence0[i] !== 'undefined' && aminoAcidSequence0[i] !== null){
							currentResidues0 = aminoAcidSequence0[i].residues;
							resn0 = aminoAcidSequence0[i].resn;
							string += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
						else{
							string += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
					}
					if(typeof aminoAcidSequence0[i] !== 'undefined' && aminoAcidSequence0[i] !== null){
						currentResidues0 = aminoAcidSequence0[i].residues;
						resn0 = aminoAcidSequence0[i].resn;
						if( typeof aminoAcidSequence1[i] !== 'undefined' && aminoAcidSequence1[i] !== null ){
							currentResidues1 = aminoAcidSequence1[i].residues;
							resn1 = aminoAcidSequence1[i].resn;
							string0 += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']); highLightAlignedMolecule( '+glmol1.id+',['+currentResidues1.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']); unHighLightAlignedMolecule('+glmol1.id+',['+currentResidues1.join(',')+']);">';
						}
						else{
							string0 += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+glmol0.id+',['+currentResidues0.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+glmol0.id+',['+currentResidues0.join(',')+']);">';
						}
					}
				}
				$('#' + this.glmol0.id + '_seq').html(string0);
				$('#' + this.glmol0.id + '_seq').jqDock('destroy');
				$('#' + this.glmol0.id + '_seq').jqDock({size:10, sizeMax:65, distance:20});
			}
		}
	}
	//only one sequence is exist
	else{   
		var aminoAcidSequence = this.getAminoAcidSequence(molecule);
		
		for( var i = 0; i < aminoAcidSequence.length; i++){
			currentResidues = aminoAcidSequence[i].residues;
			resn = aminoAcidSequence[i].resn;
			string += '<img src="letters/'+resn.toLowerCase()+'.png" title="'+resn.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( '+molecule.id+',['+currentResidues.join(',')+']);" onmouseout="unHighLightAlignedMolecule('+molecule.id+',['+currentResidues.join(',')+']);">';		
		}
	}
	
	$('#' + molecule.id + '_seq').html(string);
	$('#' + molecule.id + '_seq').jqDock('destroy');
	var dockOptions ={size:10, sizeMax:65, distance:20};
	$('#' + molecule.id + '_seq').jqDock(dockOptions);
};

//higl light the atomlist of a molecule
TuftsViewer.prototype.highLightAlignedMolecule = function(mol,atomlist){
	if(mol.id === this.glmol0.id){
		mol = this.glmol0;
	}else if(mol.id === this.glmol1.id){
		mol = this.glmol1;
	}else{
		throw new Error("The protein object does not exit!");
		return;
	}
	//save the original color of those highlighted atoms
	if(mol.id === this.glmol0.id){
		this.saveAtomsColor0 = this.glmol0.saveAtomsColor(atomlist);
	}
	if(mol.id === this.glmol1.id){
		this.saveAtomsColor1 = this.glmol1.saveAtomsColor(atomlist);
	}
	//use "colorAtoms" function in GLmol to high light the atoms red
	mol.colorAtoms(atomlist, 0xff0000);
	mol.show();
};

//unhighlight the atomlist of a molecule
TuftsViewer.prototype.unHighLightAlignedMolecule = function(mol, atomlist){
	if(mol.id === this.glmol0.id){
		mol = this.glmol0;
	}else if(mol.id === this.glmol1.id){
		mol = this.glmol1;
	}else{
		throw new Error("The protein object does not exit!");
		return;
	}
	var savedAtomsColor;
	if(mol.id === this.glmol0.id){
		savedAtomsColor = this.saveAtomsColor0;

	}
	if(mol.id === this.glmol1.id){
		savedAtomsColor = this.saveAtomsColor1;
	}
	
	for(var i in atomlist){
		var atom = mol.atoms[atomlist[i]];
		if(atom === undefined )continue;
		mol.colorAtoms([atomlist[i]],savedAtomsColor[i]);
	}
	mol.show();
};
//download the protein file from "www.pdb.org" and then load the aminoacid sequence base on jqdock class
TuftsViewer.prototype.download = function(molecule, query){
	var obj = this;
	var baseURL = '';
	if(molecule === this.glmol0.id){
		molecule = this.glmol0;
	}else if(molecule === this.glmol1.id){
		molecule = this.glmol1;
	}else{
		throw new Error("The protein object does not exit!");
		return;
	}
	if (query.substr(0, 4) == 'pdb:') {
		query = query.substr(4).toUpperCase();
		if (!query.match(/^[1-9][A-Za-z0-9]{3}$/)) {
			alert("Wrong PDB ID"); return;
		}
		url = "http://www.pdb.org/pdb/files/" + query + ".pdb";
	}else if (query.substr(0, 4) == 'cid:') {
		query = query.substr(4);
		if (!query.match(/^[1-9]+$/)) {
			alert("Wrong Compound ID"); return;
		}
		url = "http://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + query + 
			"/SDF?record_type=3d";
	}
	var source = molecule.id+"_src";
	$('#loading').show();
	$.get(url, function(ret) {
		$("#"+source).val(ret);
		obj.loadMolecule(molecule);
		$('#loading').hide();
	});
};

//The function is called when the choice of DropDownList is changed
TuftsViewer.prototype.drawSelectChanged = function(){
	var drawSelectValue = $("#drawSelect").val();
	if(drawSelectValue == "Coupled"){
		//unbind the individual mouse events of these two GLmol instances
		$(this.glmol0.renderer.domElement).unbind()
		$(this.glmol1.renderer.domElement).unbind()
		////Couple the mouse events of two 3D canvas
		this.dualMouseActions(this.glmol0, this.glmol1);
		console.log("Coupled");
	}
	if(drawSelectValue == "Uncoupled"){
		//unbind the coupled mouse events
		$(this.glmol0.renderer.domElement).unbind()
		$(this.glmol1.renderer.domElement).unbind()
		//bind the individual mouse envets of two instances
		this.glmol0.enableMouse();
		this.glmol1.enableMouse();
		console.log("Uncoupled");
	}
};

//Get the AminoAcid sequence of one GLmol instance
//molecule is a instance of GLmol class
TuftsViewer.prototype.getAminoAcidSequence = function(molecule){
	var aminoAcidSequence = [];
	var currentChain, currentResi, currentResn, currentResidues = [];
	var length = molecule.atoms.length;
	for (var i = 0; i < length; i++) {	
		atom = molecule.atoms[i]; if (!atom) continue;
		if (atom.resn == "HOH") continue;
		var nextAtom = molecule.atoms[i+1];
		if(!nextAtom){
			if (currentResidues.length > 0) {				
				var resn = this.ResnTable[currentResn];
				if (!resn) break;
				var aminoAcid = new Object();;
				aminoAcid.resi = currentResi;
				aminoAcid.resn = resn;
				aminoAcid.residues = currentResidues;
				aminoAcidSequence.push(aminoAcid);
				currentResidues = [];
			}
		}else{
			if (atom.chain != currentChain || atom.resi != currentResi) {
				if (currentResidues.length > 0) {					
					var resn = this.ResnTable[currentResn];
					if (!resn) break;
					var aminoAcid = new Object();
					aminoAcid.resi = currentResi;
					aminoAcid.resn = resn;
					aminoAcid.residues = currentResidues;
					aminoAcidSequence.push(aminoAcid);
					currentResidues = [];
				}
			}
			currentChain = atom.chain;
			currentResn = atom.resn;
			currentResi = atom.resi;
			currentResidues.push(atom.serial);
		}
	}
	
	return aminoAcidSequence;
};

//set post request to "matt.cs.tufts.edu" with protein names and options
//then get the aligned sequence file from "matt.cs.tufts.edu" server
//parse the aligned sequence file and load the aligned sequence base on jqdock
TuftsViewer.prototype.proteinAlignment = function(){
	if(typeof this.glmol0.atoms === "undefined" || typeof this.glmol1.atoms === "undefined"){
		alert("Please download both proteins.");
		return;
	}
	$('#aligning').show();
	var obj = this;
	var resultURL="";
	proteinName0 = $("#"+this.glmol0.id+"_pdbid").val();
	proteinName1 = $("#"+this.glmol1.id+"_pdbid").val();
	$.ajax({
		url:"alignment.php", 
		type: 'POST',
		dataType: 'html',
		data:"pdbs="+proteinName0+","+proteinName1+"&rename=rename&SEQRES=SEQRES&verbose=verbose&partial=partial&cutoff=5.000",
		async:true,
		success:function(response){
			console.log("success");
			console.log(response);
			var outputTxt = $(response).find('#outputTxt').html();
			if( typeof outputTxt !== 'undefined' && outputTxt !== null){
				console.log(outputTxt);
				obj.parseAlignmentText(outputTxt);
				obj.loadAlignedMolecules();
				$('#aligning').hide();
			}else{
				alert("There is something wrong!");
			}
			var outputPdb = $(response).find('#outputPdb').html();
			if(typeof outputPdb !== 'undefined' && outputPdb !== null){
				console.log(outputPdb);
				var strs = obj.parseAlignedPDB(outputPdb);
				$("#"+obj.glmol0.id+"_src").val(strs[0]);
				obj.glmol0.loadMolecule();
				$("#"+obj.glmol1.id+"_src").val(strs[1]);
				obj.glmol1.loadMolecule();		
			}else{
				alert("There is something wrong!");
			}
		},
		error:function(response, thrownError){
			console.log(response.status);
			console.log(thrownError);
			console.log(response);
		}
	});
	
};

//parse the alignment sequence file get from "matt.cs.tufts.edu"
TuftsViewer.prototype.parseAlignmentText = function(str){
	lines = str.split("\n");
	this.sequence0="",this.sequence1="";
	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(i==0){
			proteins = line.split(",");
			this.protein0 = proteins[0];
			this.protein0 = this.protein0.substr(1,this.protein0.length);
			this.protein1 = proteins[1];
			this.protein1 = this.protein1.substr(1,this.protein1.length-2);
		}
		if( line.indexOf(this.protein0) == 0){//the first protein
			toks = line.split(/\s+/);
			this.sequence0 += toks[1];
		}
		if( line.indexOf(this.protein1) == 0 ){//the sencond protein
			toks = line.split(/\s+/);
			this.sequence1 += toks[1];
		}
	}
	console.log(this.protein0);
	console.log(this.sequence0);
	console.log(this.protein1);
	console.log(this.sequence1);
};

//load aligned two protein sequence
TuftsViewer.prototype.loadAlignedMolecules = function() {
	$('#' + this.glmol0.id + '_seq').jqDock('destroy');
	$('#' + this.glmol0.id + '_seq').empty();
	$('#' + this.glmol1.id + '_seq').jqDock('destroy');
	$('#' + this.glmol1.id + '_seq').empty();
	proteinName0 = $("#glmol0_pdbid").val();
	proteinName1 = $("#glmol1_pdbid").val();
	var protein_0,protein_1;
	var sequence_0,sequence_1;
	//match Glmol instance with the correct sequence
	if(this.protein0.indexOf(proteinName0) != -1){
		protein_0 = this.protein0;
		protein_1 = this.protein1;
		sequence_0 = this.sequence0;
		sequence_1 = this.sequence1;
	}else{
		protein_0 = this.protein1;
		protein_1 = this.protein0;
		sequence_0 = this.sequence1;
		sequence_1 = this.sequence0;
	}
	//get the original aminoAcid sequence of two proteins
	var aminoAcidSequence0 = this.getAminoAcidSequence(this.glmol0);
	var aminoAcidSequence1 = this.getAminoAcidSequence(this.glmol1);
	
	//align them together
	var resultSequence0 = this.getAlignedSequence(sequence_0, aminoAcidSequence0);
	var resultSequence1 = this.getAlignedSequence(sequence_1, aminoAcidSequence1);
	
	this.alignedSequence0 = resultSequence0;
	this.alignedSequence1 = resultSequence1;
	
	//show the sequence base on jqdock class
	var str0 = "", str1 = "";
	for( var i = 0; i < resultSequence0.length; i++){
		//if both aligned sequence are aminoAcids
		if( (typeof resultSequence0[i] !== 'undefined' && resultSequence0[i] !== null) && (typeof resultSequence1[i] !== 'undefined' && resultSequence1[i] !== null)){
			currentResidues0 = resultSequence0[i].residues;
			resn0 = resultSequence0[i].resn;
			currentResidues1 = resultSequence1[i].residues;
			resn1 = resultSequence1[i].resn;
			str0 += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( glmol0,['+currentResidues0.join(',')+']); highLightAlignedMolecule( glmol1,['+currentResidues1.join(',')+']); enterImage(glmol0,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol0,['+currentResidues0.join(',')+']); unHighLightAlignedMolecule(glmol1,['+currentResidues1.join(',')+']); leaveImage(glmol0);" onclick="highLightAlignedSequence('+i+')">';
			str1 += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( glmol0,['+currentResidues0.join(',')+']); highLightAlignedMolecule( glmol1,['+currentResidues1.join(',')+']); enterImage(glmol1,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol0,['+currentResidues0.join(',')+']); unHighLightAlignedMolecule(glmol1,['+currentResidues1.join(',')+']); leaveImage(glmol1);" onclick="highLightAlignedSequence('+i+')">';
		}
		//if one is aminoAcid another is a dash line
		else if( (typeof resultSequence0[i] !== 'undefined' && resultSequence0[i] !== null) && (typeof resultSequence1[i] === 'undefined' || resultSequence1[i] === null)){
			currentResidues0 = resultSequence0[i].residues;
			resn0 = resultSequence0[i].resn;
			str0 += '<img src="letters/'+resn0.toLowerCase()+'.png" title="'+resn0.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( glmol0,['+currentResidues0.join(',')+']); enterImage(glmol0,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol0,['+currentResidues0.join(',')+']); leaveImage(glmol0);" onclick="highLightAlignedSequence('+i+')">';
			str1 += '<img src="letters/dash.png" title="Dash" alt="" onmouseover="highLightAlignedMolecule( glmol0,['+currentResidues0.join(',')+']); enterImage(glmol1,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol0,['+currentResidues0.join(',')+']); leaveImage(glmol1);" onclick="highLightAlignedSequence('+i+')">';
		}
		else if( (typeof resultSequence0[i] === 'undefined' || resultSequence0[i] === null) && (typeof resultSequence1[i] !== 'undefined' && resultSequence1[i] !== null)){
			currentResidues1 = resultSequence1[i].residues;
			resn1 = resultSequence1[i].resn;
			str0 += '<img src="letters/dash.png" title="Dash" alt="" onmouseover="highLightAlignedMolecule( glmol1,['+currentResidues1.join(',')+']); enterImage(glmol0,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol1,['+currentResidues1.join(',')+']); leaveImage(glmol0);" onclick="highLightAlignedSequence('+i+')">';
			str1 += '<img src="letters/'+resn1.toLowerCase()+'.png" title="'+resn1.toUpperCase()+'" alt="" onmouseover="highLightAlignedMolecule( glmol1,['+currentResidues1.join(',')+']); enterImage(glmol1,'+i+');" onmouseout="unHighLightAlignedMolecule(glmol1,['+currentResidues1.join(',')+']); leaveImage(glmol1);" onclick="highLightAlignedSequence('+i+')">';
		}
		//if both are dash lines
		else{
			str0 += '<img src="letters/dash.png" title="Dash" alt="" onmouseover="enterImage(glmol0,'+i+');" onmouseout="leaveImage(glmol0);" onclick="highLightAlignedSequence('+i+')">';
			str1 += '<img src="letters/dash.png" title="Dash" alt="" onmouseover="enterImage(glmol1,'+i+');" onmouseout="leaveImage(glmol1);" onclick="highLightAlignedSequence('+i+')">';
		}
		
	}
	
	var dockOptions ={size:10, sizeMax:65, distance:20};
	
	$('#' + this.glmol0.id + '_seq').html(str0);
	$('#' + this.glmol0.id + '_seq').jqDock('destroy');
	$('#' + this.glmol0.id + '_seq').jqDock(dockOptions);
	
	$('#' + this.glmol1.id + '_seq').html(str1);
	$('#' + this.glmol1.id + '_seq').jqDock('destroy');
	$('#' + this.glmol1.id + '_seq').jqDock(dockOptions);

};

//hight light both aminoacid sequences and show those aminoacids white
TuftsViewer.prototype.highLightAlignedSequence = function(index){
	if(this.mouseClicked === false){
		this.mouseClicked = true;
		this.imgIndex = index;
	}else{
		var small = 0, big =0;
		if(this.imgIndex >= index){
			small = index;
			big = this.imgIndex;
		}else{
			small = this.imgIndex;
			big = index;
		}
		
		var resultSequence0 = this.alignedSequence0;
		var resultSequence1 = this.alignedSequence1;
		for(var i = small; i <= big; i++){
			if( (typeof resultSequence0[i] !== 'undefined' && resultSequence0[i] !== null)){
				currentResidues0 = resultSequence0[i].residues;
				this.glmol0.colorAtoms( currentResidues0, 0xffffff);
			}
			if((typeof resultSequence1[i] !== 'undefined' && resultSequence1[i] !== null)){
				currentResidues1 = resultSequence1[i].residues;
				this.glmol1.colorAtoms( currentResidues1, 0xffffff);
			}
		}
		this.glmol0.show();
		this.glmol1.show();
		this.mouseClicked = false;
		this.imgIndex = -1;
	}
};

//match the original aminoAcid sequence with the aligned sequence which contains dash
TuftsViewer.prototype.getAlignedSequence = function(sequence, aminoAcidSequence){
	var resultSequence = [];
	var j = 0;//iteration variable of sequence
	for(var i = 0; i < sequence.length; i++){
		var aminoAcid_aligned = sequence.charAt(i);
		if(aminoAcidSequence[j] == 'undefined' || aminoAcidSequence[j] == null){
			resultSequence.push(null);
			continue;
		}
		var aminoAcid = aminoAcidSequence[j].resn;
		if(aminoAcid_aligned.toLowerCase() == aminoAcid.toLowerCase()){
			resultSequence.push(aminoAcidSequence[j]);
			j++;
		}
		else{
			resultSequence.push(null);
		}
	}
	return resultSequence;
};

//remote control of another sequence, onmouseover event
TuftsViewer.prototype.enterImage = function(mol,imgIndex){
	if(mol.id === this.glmol0.id){
		$("#"+this.glmol1.id+"_seq img").eq(imgIndex).jqDock("expand");
	}
	if(mol.id === this.glmol1.id){
		$("#"+this.glmol0.id+"_seq img").eq(imgIndex).jqDock("expand");
	}
};
//remote control of another sequence, onmouseout event 
TuftsViewer.prototype.leaveImage = function(mol){
	if(mol.id === this.glmol0.id){
		$('#'+this.glmol1.id+'_seq.jqDocked').jqDock('idle');
		$("#"+this.glmol1.id+"_seq").trigger("docknudge");
		$("#"+this.glmol1.id+"_seq").show();
	}
	if(mol.id === this.glmol1.id){
		$('#'+this.glmol0.id+'_seq.jqDocked').jqDock('idle');
		$("#"+this.glmol0.id+"_seq").trigger("docknudge");		
		$("#"+this.glmol0.id+"_seq").show();
	}
};

//parse the alignment pdb file get from "matt.cs.tufts.edu"
TuftsViewer.prototype.parseAlignedPDB = function(str){
	var lines = str.split("\n");
	var src0 = "";
	var src1 = "";
	var offset; //the offset for the second protein
	var label = false;
	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		var recordName = line.substr(0, 4);
		if (recordName == 'ATOM'){
			var chain = line.substr(21, 1);			
			//var serial = parseInt(line.substr(6, 5));
			//var resi = parseInt(line.substr(22, 5));	
			if (chain == 'A'){
				src0 += line + "\n";
			}
			if (label == false && chain == 'B'){
				serial = parseInt(line.substr(6, 5));
				offset = serial - 1;
				label = true;
			}
			if (chain == 'B'){
				var newSerial = parseInt(line.substr(6, 5)) - offset;
				line = line.substr(0,6) + this.FormatNumberLength(newSerial, 5)+ line.substr(11, 10) + line.substr(21, 1).replace('B', 'A')+line.substr(22);
				src1 += line + "\n";
			}
		}
	}
	console.log(src0);
	console.log(src1);
	var strs = [];
	strs.push(src0);
	strs.push(src1);
	return strs;	
};

//format the number to string
TuftsViewer.prototype.FormatNumberLength = function(num, length){
    var r = "" + num;
    while (r.length < length) {
        r = " " + r;
    }
    return r;
};

//save the atomlist colors of a amino acid
GLmol.prototype.saveAtomsColor = function(atomlist){
	var atomsColor = [];
	for(var i in atomlist){
		var atom = this.atoms[atomlist[i]]; if(atom == undefined ) continue;
		atomsColor[i] = this.saveOldColor(atom.serial);
	}
	return atomsColor;
};

//save a original color of a atom
GLmol.prototype.saveOldColor = function(serial){
	var r, g,b;
	r = this.colortable[serial*3];
	g = this.colortable[serial*3+1];
	b = this.colortable[serial*3+2];
	var color = r*65536+g*256+b;
	return color;
};











