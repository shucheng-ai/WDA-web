<!--
 * @description: 
 * @param: 
 * @return: 
 * @author: Sakura
-->
<template>
	<a-layout-header
		:style="{
			position: 'fixed',
			top: 0,
			left: 0,
			zIndex: 999,
			width: '100%',
			height: '45px',
		}"
	>
		<div class="logo">
			<p class="logo-text">WDA</p>
			<!-- <img src="../../assets/images/logo.png" width="100px" /> -->
		</div>

		<!--        <a-menu-->
		<!--                theme="dark"-->
		<!--                mode="horizontal"-->
		<!--                :defaultSelectedKeys="['2']"-->
		<!--                :style="{ lineHeight: '45px' }"-->
		<!--        >-->
		<!--            <a-menu-item key="project">-->
		<!--                <router-link to="/project/1" class="ui-nav-item">Projcet</router-link>-->
		<!--            </a-menu-item>-->
		<!--        </a-menu>-->
	</a-layout-header>
</template>

<script>
export default {
	name: 'projects.nav',
};
</script>

<style scoped>
.logo {
	display: inline-block;
	width: 150px;
	height: 45px;
	float: left;
	color: white;
	font-size: 28px;
	cursor: pointer;
	margin: 0 -55px;
}
.logo-text {
	font-size: 24px;
	line-height: 45px;
	margin-left: 20px;
	filter: brightness(0.88);
}
</style>
