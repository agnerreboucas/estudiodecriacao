/* ===== Arquivos PHP/JS/CSS do tema WordPress gerado (modelos com marcadores __TOKEN__ trocados pelo gerador). Sem dependência além do Elementor (gratuito). ===== */
const WPT = {};
WPT.functions = String.raw`<?php
/**
 * Tema gerado pelo Ampliação Studio para __NAME__.
 * As páginas são criadas na ativação e editadas no Elementor.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'AMP_VER', '__VER__' );
define( 'AMP_SLUG', '__SLUG__' );

function amp_defaults() {
	static $d = null;
	if ( null === $d ) {
		$f = get_template_directory() . '/inc/defaults.json';
		$d = is_file( $f ) ? json_decode( file_get_contents( $f ), true ) : array();
		if ( ! is_array( $d ) ) {
			$d = array();
		}
	}
	return $d;
}
function amp_opt( $key ) {
	$d = amp_defaults();
	return get_theme_mod( $key, isset( $d[ $key ] ) ? $d[ $key ] : '' );
}

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 80, 'width' => 260, 'flex-width' => true, 'flex-height' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	register_nav_menus( array( 'primary' => 'Menu principal', 'footer' => 'Menu do rodapé' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$d = amp_defaults();
	if ( ! empty( $d['fonts'] ) && is_array( $d['fonts'] ) ) {
		$fam = array();
		foreach ( $d['fonts'] as $f ) {
			$fam[] = 'family=' . str_replace( '%20', '+', rawurlencode( $f ) ) . ':wght@400;600;700;800';
		}
		wp_enqueue_style( 'amp-fonts', 'https://fonts.googleapis.com/css2?' . implode( '&', $fam ) . '&display=swap', array(), null );
	}
	wp_enqueue_style( 'amp-style', get_stylesheet_uri(), array(), AMP_VER );
	wp_enqueue_script( 'amp-theme', get_template_directory_uri() . '/assets/js/theme.js', array(), AMP_VER, true );
} );

/* ---------- Personalizar: marca, leads e rastreamento ---------- */
add_action( 'customize_register', function ( $wp ) {
	$sections = array(
		'amp_brand'  => array( 'Marca e contato', array(
			'brand'          => 'Nome da marca (se não houver logo)',
			'header_cta'     => 'Texto do botão do cabeçalho (vazio = sem botão)',
			'header_cta_url' => 'Endereço do botão do cabeçalho',
			'footer_text'    => 'Texto do rodapé',
			'contact_text'   => 'Contato no rodapé',
			'wa_number'      => 'WhatsApp (DDI + DDD + número)',
			'wa_message'     => 'Mensagem inicial do WhatsApp',
			'privacy_url'    => 'Política de privacidade (endereço)',
		) ),
		'amp_leads'  => array( 'Captura de leads', array(
			'leads_url'  => 'Endereço de captura de leads (do Studio)',
			'thanks_url' => 'Página de obrigado (endereço)',
			'thanks_title' => 'Título da página de obrigado',
			'thanks_text'  => 'Texto da página de obrigado',
		) ),
		'amp_track'  => array( 'Rastreamento', array(
			'pixel' => 'ID do Pixel da Meta (só números)',
			'ga4'   => 'ID do Google Analytics 4 (G-XXXXXXX)',
		) ),
	);
	$d = amp_defaults();
	foreach ( $sections as $sid => $s ) {
		$wp->add_section( $sid, array( 'title' => $s[0], 'priority' => 30 ) );
		foreach ( $s[1] as $key => $label ) {
			$wp->add_setting( $key, array( 'default' => isset( $d[ $key ] ) ? $d[ $key ] : '', 'sanitize_callback' => 'sanitize_text_field' ) );
			$wp->add_control( $key, array( 'label' => $label, 'section' => $sid, 'type' => 'text' ) );
		}
	}
} );

/* ---------- Formulário de leads: [amp_lead_form title="" text="" button="Enviar"] ---------- */
add_shortcode( 'amp_lead_form', function ( $atts ) {
	$a = shortcode_atts( array( 'title' => '', 'text' => '', 'button' => 'Enviar' ), $atts, 'amp_lead_form' );
	$privacy = amp_opt( 'privacy_url' );
	ob_start();
	?>
	<div class="amp-form" data-leads="<?php echo esc_url( amp_opt( 'leads_url' ) ); ?>" data-thanks="<?php echo esc_url( amp_opt( 'thanks_url' ) ); ?>">
		<?php if ( $a['title'] ) : ?><h2><?php echo esc_html( $a['title'] ); ?></h2><?php endif; ?>
		<?php if ( $a['text'] ) : ?><p class="amp-sub"><?php echo esc_html( $a['text'] ); ?></p><?php endif; ?>
		<form novalidate>
			<input type="text" name="name" placeholder="Seu nome" required autocomplete="name" aria-label="Seu nome">
			<input type="tel" name="phone" placeholder="WhatsApp com DDD" required autocomplete="tel" inputmode="tel" aria-label="WhatsApp">
			<input type="email" name="email" placeholder="E-mail (opcional)" autocomplete="email" aria-label="E-mail">
			<input type="text" name="message" placeholder="O que você precisa? (opcional)" aria-label="Mensagem">
			<input type="text" name="website" tabindex="-1" autocomplete="off" class="amp-hp" aria-hidden="true">
			<label class="amp-consent"><input type="checkbox" name="consent" value="sim"> Concordo em receber contato por WhatsApp, telefone ou e-mail.<?php if ( $privacy ) : ?> <a href="<?php echo esc_url( $privacy ); ?>" target="_blank" rel="noopener">Política de privacidade</a><?php endif; ?></label>
			<button type="submit" class="amp-btn"><?php echo esc_html( $a['button'] ); ?></button>
			<p class="amp-msg" role="status" hidden></p>
		</form>
	</div>
	<?php
	return ob_get_clean();
} );

/* ---------- SEO básico (só se não houver plugin de SEO), rastreamento e ícone ---------- */
function amp_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || class_exists( 'RankMath' ) || defined( 'AIOSEO_VERSION' );
}
add_filter( 'pre_get_document_title', function ( $t ) {
	if ( is_singular() && ! amp_has_seo_plugin() ) {
		$m = get_post_meta( get_the_ID(), '_amp_title', true );
		if ( $m ) {
			return $m;
		}
	}
	return $t;
} );
add_action( 'wp_head', function () {
	if ( is_singular() && ! amp_has_seo_plugin() ) {
		$id   = get_the_ID();
		$desc = get_post_meta( $id, '_amp_desc', true );
		$og   = get_post_meta( $id, '_amp_og', true );
		if ( $desc ) {
			echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
			echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		echo '<meta property="og:title" content="' . esc_attr( wp_get_document_title() ) . '">' . "\n";
		echo '<meta property="og:type" content="website">' . "\n";
		echo '<meta property="og:url" content="' . esc_url( get_permalink( $id ) ) . '">' . "\n";
		if ( $og ) {
			echo '<meta property="og:image" content="' . esc_url( get_template_directory_uri() . '/assets/img/' . $og ) . '">' . "\n";
		}
	}
	if ( ! has_site_icon() && is_file( get_template_directory() . '/assets/favicon.png' ) ) {
		echo '<link rel="icon" type="image/png" href="' . esc_url( get_template_directory_uri() . '/assets/favicon.png' ) . '">' . "\n";
	}
	$px  = preg_replace( '/\D/', '', (string) amp_opt( 'pixel' ) );
	$ga  = preg_replace( '/[^A-Za-z0-9\-]/', '', (string) amp_opt( 'ga4' ) );
	$thx = is_page( 'obrigado' );
	if ( $px ) {
		echo "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','" . esc_js( $px ) . "');fbq('track','PageView');" . ( $thx ? "fbq('track','Lead');" : '' ) . "</script>\n";
	}
	if ( $ga ) {
		echo '<script async src="https://www.googletagmanager.com/gtag/js?id=' . esc_attr( $ga ) . '"></script>';
		echo "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','" . esc_js( $ga ) . "');" . ( $thx ? "gtag('event','generate_lead');" : '' ) . "</script>\n";
	}
}, 5 );

/* ---------- Instalação das páginas, do menu e do obrigado ao ativar o tema ---------- */
function amp_install_content( $force = false ) {
	$file = get_template_directory() . '/inc/pages.json';
	if ( ! is_file( $file ) ) {
		return array( 'created' => 0, 'updated' => 0, 'skipped' => 0 );
	}
	$pages = json_decode( file_get_contents( $file ), true );
	if ( ! is_array( $pages ) ) {
		return array( 'created' => 0, 'updated' => 0, 'skipped' => 0 );
	}
	$uri      = untrailingslashit( get_template_directory_uri() );
	$created  = 0;
	$updated  = 0;
	$skipped  = 0;
	$ids      = array();
	$home     = 0;
	$order    = 0;
	foreach ( $pages as $pg ) {
		$order++;
		$slug = sanitize_title( $pg['slug'] );
		$ex   = get_page_by_path( $slug, OBJECT, 'page' );
		$data = isset( $pg['elementor'] ) ? $pg['elementor'] : array();
		array_walk_recursive( $data, function ( &$v ) use ( $uri ) {
			if ( is_string( $v ) ) {
				$v = str_replace( '{{THEME_URI}}', $uri, $v );
			}
		} );
		$meta = array(
			'_amp_page'                => 1,
			'_amp_title'               => isset( $pg['seo']['title'] ) ? $pg['seo']['title'] : '',
			'_amp_desc'                => isset( $pg['seo']['desc'] ) ? $pg['seo']['desc'] : '',
			'_amp_og'                  => isset( $pg['seo']['og'] ) ? $pg['seo']['og'] : '',
			'_wp_page_template'        => 'default',
			'_elementor_edit_mode'     => 'builder',
			'_elementor_template_type' => 'wp-page',
			'_elementor_version'       => '3.18.0',
			'_elementor_data'          => wp_slash( wp_json_encode( $data ) ),
		);
		if ( $ex && ! ( $force && get_post_meta( $ex->ID, '_amp_page', true ) ) ) {
			$ids[ $slug ] = $ex->ID;
			$skipped++;
			if ( ! empty( $pg['home'] ) ) {
				$home = $ex->ID;
			}
			continue;
		}
		if ( $ex ) {
			$id = $ex->ID;
			wp_update_post( array( 'ID' => $id, 'post_title' => $pg['title'], 'post_status' => 'publish' ) );
			$updated++;
		} else {
			$id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $pg['title'], 'post_name' => $slug, 'post_content' => '', 'menu_order' => $order ) );
			if ( is_wp_error( $id ) || ! $id ) {
				continue;
			}
			$created++;
		}
		foreach ( $meta as $k => $v ) {
			update_post_meta( $id, $k, $v );
		}
		$ids[ $slug ] = $id;
		if ( ! empty( $pg['home'] ) ) {
			$home = $id;
		}
	}
	/* página de obrigado */
	if ( ! get_page_by_path( 'obrigado', OBJECT, 'page' ) ) {
		$tid = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Obrigado', 'post_name' => 'obrigado', 'post_content' => '' ) );
		if ( $tid && ! is_wp_error( $tid ) ) {
			update_post_meta( $tid, '_amp_page', 1 );
			update_post_meta( $tid, '_amp_title', 'Obrigado' );
		}
	}
	/* página inicial */
	if ( $home ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home );
	}
	/* menu */
	$menu = wp_get_nav_menu_object( 'Menu principal' );
	if ( ! $menu ) {
		$mid = wp_create_nav_menu( 'Menu principal' );
		if ( ! is_wp_error( $mid ) ) {
			$pos = 0;
			foreach ( $pages as $pg ) {
				$slug = sanitize_title( $pg['slug'] );
				if ( empty( $pg['menu'] ) || empty( $ids[ $slug ] ) ) {
					continue;
				}
				$pos++;
				wp_update_nav_menu_item( $mid, 0, array(
					'menu-item-title'     => $pg['title'],
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $ids[ $slug ],
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
					'menu-item-position'  => $pos,
				) );
			}
			$loc            = get_theme_mod( 'nav_menu_locations', array() );
			$loc['primary'] = $mid;
			$loc['footer']  = $mid;
			set_theme_mod( 'nav_menu_locations', $loc );
		}
	}
	if ( '' === get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}
	flush_rewrite_rules();
	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	update_option( 'amp_installed_' . AMP_SLUG, 1 );
	return array( 'created' => $created, 'updated' => $updated, 'skipped' => $skipped );
}
add_action( 'after_switch_theme', function () {
	if ( ! get_option( 'amp_installed_' . AMP_SLUG ) ) {
		amp_install_content( false );
	}
} );

/* ---------- Aviso do Elementor e tela "Páginas do Studio" ---------- */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) || defined( 'ELEMENTOR_VERSION' ) ) {
		return;
	}
	echo '<div class="notice notice-warning"><p><strong>' . esc_html( '__NAME__' ) . ':</strong> as páginas deste tema são feitas no Elementor. Instale e ative o plugin <strong>Elementor</strong> (gratuito) para vê-las e editá-las.</p></div>';
} );
add_action( 'admin_menu', function () {
	add_theme_page( 'Páginas do Studio', 'Páginas do Studio', 'manage_options', 'amp-pages', function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$msg = isset( $_GET['amp_done'] ) ? sanitize_text_field( wp_unslash( $_GET['amp_done'] ) ) : '';
		echo '<div class="wrap"><h1>Páginas do Studio</h1>';
		if ( $msg ) {
			echo '<div class="notice notice-success"><p>' . esc_html( $msg ) . '</p></div>';
		}
		echo '<p>As páginas, o menu e a página de obrigado foram criados quando o tema foi ativado. Se alguma página sumiu ou você quer voltar ao desenho original do Studio, use os botões abaixo.</p>';
		foreach ( array( 'missing' => 'Criar só as páginas que faltam', 'reset' => 'Refazer as páginas do tema (apaga as edições feitas nelas)' ) as $mode => $label ) {
			echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="margin:10px 0">';
			wp_nonce_field( 'amp_reinstall' );
			echo '<input type="hidden" name="action" value="amp_reinstall"><input type="hidden" name="mode" value="' . esc_attr( $mode ) . '">';
			submit_button( $label, 'reset' === $mode ? 'secondary' : 'primary', 'submit', false, 'reset' === $mode ? array( 'onclick' => "return confirm('Isso substitui o conteúdo das páginas criadas pelo tema. Continuar?')" ) : array() );
			echo '</form>';
		}
		echo '</div>';
	} );
} );
add_action( 'admin_post_amp_reinstall', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sem permissão.' );
	}
	check_admin_referer( 'amp_reinstall' );
	$r   = amp_install_content( isset( $_POST['mode'] ) && 'reset' === $_POST['mode'] );
	$txt = sprintf( '%d criada(s), %d refeita(s), %d mantida(s).', $r['created'], $r['updated'], $r['skipped'] );
	wp_safe_redirect( add_query_arg( array( 'page' => 'amp-pages', 'amp_done' => rawurlencode( $txt ) ), admin_url( 'themes.php' ) ) );
	exit;
} );
`;

WPT.header = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="sh">
	<div class="w sh-in">
		<a class="sh-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<?php
			if ( has_custom_logo() ) {
				the_custom_logo();
			} else {
				echo esc_html( amp_opt( 'brand' ) ? amp_opt( 'brand' ) : get_bloginfo( 'name' ) );
			}
			?>
		</a>
		<input type="checkbox" id="mn" class="mn-i" aria-label="Abrir menu">
		<label for="mn" class="mn-b" aria-hidden="true"><i></i><i></i><i></i></label>
		<nav class="sh-nav" aria-label="Menu principal">
			<?php
			wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'menu_class' => 'sh-menu', 'fallback_cb' => false, 'depth' => 2 ) );
			if ( amp_opt( 'header_cta' ) ) {
				echo '<a class="amp-btn sh-cta" href="' . esc_url( amp_opt( 'header_cta_url' ) ? amp_opt( 'header_cta_url' ) : '#form' ) . '">' . esc_html( amp_opt( 'header_cta' ) ) . '</a>';
			}
			?>
		</nav>
	</div>
</header>
<main id="conteudo">
`;

WPT.footer = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$wa = preg_replace( '/\D/', '', (string) amp_opt( 'wa_number' ) );
?>
</main>
<footer class="sf">
	<div class="w">
		<div class="sf-g">
			<div>
				<b><?php echo esc_html( amp_opt( 'brand' ) ? amp_opt( 'brand' ) : get_bloginfo( 'name' ) ); ?></b>
				<?php if ( amp_opt( 'footer_text' ) ) : ?><p><?php echo esc_html( amp_opt( 'footer_text' ) ); ?></p><?php endif; ?>
			</div>
			<div class="sf-n"><?php wp_nav_menu( array( 'theme_location' => 'footer', 'container' => false, 'menu_class' => 'sf-menu', 'fallback_cb' => false, 'depth' => 1 ) ); ?></div>
			<div><?php if ( amp_opt( 'contact_text' ) ) { echo wp_kses_post( nl2br( esc_html( amp_opt( 'contact_text' ) ) ) ); } ?></div>
		</div>
		<div class="sf-c"><?php echo esc_html( amp_opt( 'brand' ) ? amp_opt( 'brand' ) : get_bloginfo( 'name' ) ); ?> &middot; <?php echo esc_html( gmdate( 'Y' ) ); ?><?php if ( amp_opt( 'privacy_url' ) ) : ?> &middot; <a href="<?php echo esc_url( amp_opt( 'privacy_url' ) ); ?>">Privacidade</a><?php endif; ?></div>
	</div>
</footer>
<?php if ( $wa ) : ?>
<a class="wa-fab" href="<?php echo esc_url( 'https://wa.me/' . $wa . '?text=' . rawurlencode( amp_opt( 'wa_message' ) ? amp_opt( 'wa_message' ) : 'Olá! Vim pelo site.' ) ); ?>" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M16 3C9 3 3.4 8.6 3.4 15.5c0 2.4.7 4.7 1.9 6.6L3 29l7.1-1.9c1.9 1 4 1.6 6.1 1.6 7 0 12.6-5.6 12.6-12.5S23 3 16 3zm0 22.9c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.2 1.1 1.1-4.1-.3-.4a10.3 10.3 0 1 1 9.2 5.1zm5.7-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-1.9-.9-3.1-1.7-4.3-3.8-.3-.5.3-.5.9-1.6.1-.2.1-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.3 4.7 2 .8 2.7.9 3.7.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/></svg></a>
<?php endif; ?>
<?php wp_footer(); ?>
</body>
</html>
`;

WPT.page = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
while ( have_posts() ) {
	the_post();
	the_content();
}
get_footer();
`;
WPT.index = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
?>
<div class="w amp-blog">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<article <?php post_class( 'amp-post' ); ?>>
		<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<?php if ( is_singular() ) { the_content(); } else { the_excerpt(); } ?>
	</article>
<?php endwhile; the_posts_pagination(); else : ?>
	<p>Nada por aqui ainda.</p>
<?php endif; ?>
</div>
<?php get_footer(); ?>
`;
WPT.notfound = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
?>
<div class="w amp-thx"><h1>Página não encontrada</h1><p>O endereço que você abriu não existe ou foi movido.</p><p><a class="amp-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar ao início</a></p></div>
<?php get_footer(); ?>
`;
WPT.thanks = String.raw`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
$wa = preg_replace( '/\D/', '', (string) amp_opt( 'wa_number' ) );
?>
<div class="w amp-thx">
	<div class="amp-ck" aria-hidden="true">&#10003;</div>
	<h1><?php echo esc_html( amp_opt( 'thanks_title' ) ? amp_opt( 'thanks_title' ) : 'Recebemos os seus dados' ); ?></h1>
	<p><?php echo esc_html( amp_opt( 'thanks_text' ) ? amp_opt( 'thanks_text' ) : 'Obrigado! Nossa equipe vai entrar em contato com você em breve, pelo WhatsApp informado.' ); ?></p>
	<?php if ( $wa ) : ?><p><a class="amp-btn" href="<?php echo esc_url( 'https://wa.me/' . $wa . '?text=' . rawurlencode( amp_opt( 'wa_message' ) ? amp_opt( 'wa_message' ) : 'Olá! Acabei de enviar meus dados pelo site.' ) ); ?>" rel="noopener">Falar agora no WhatsApp</a></p><?php endif; ?>
	<p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar ao início</a></p>
</div>
<?php get_footer(); ?>
`;
WPT.js = String.raw`(function () {
	'use strict';
	/* guarda a origem (UTM) durante a visita, para o lead chegar com a campanha */
	try {
		var q = new URLSearchParams(location.search), u = JSON.parse(sessionStorage.getItem('amp_utm') || '{}'), ch = false;
		q.forEach(function (v, k) { if (/^utm_|^gclid$|^fbclid$/.test(k)) { u[k] = v; ch = true; } });
		if (ch) { sessionStorage.setItem('amp_utm', JSON.stringify(u)); }
	} catch (e) { /* sem armazenamento */ }
	document.addEventListener('submit', function (e) {
		var f = e.target.closest && e.target.closest('.amp-form form');
		if (!f) { return; }
		e.preventDefault();
		var box = f.parentNode, msg = f.querySelector('.amp-msg'), d = {}, utm = {};
		new FormData(f).forEach(function (v, k) { d[k] = v; });
		var say = function (t, bad) { msg.hidden = false; msg.textContent = t; msg.className = 'amp-msg' + (bad ? ' bad' : ''); };
		if (d.website) { return; }
		if (!d.name || !d.phone || !d.consent) { say('Preencha nome, WhatsApp e aceite o contato.', true); return; }
		var url = box.getAttribute('data-leads');
		if (!url) { say('Formulário sem destino configurado (Personalizar → Captura de leads).', true); return; }
		try { utm = JSON.parse(sessionStorage.getItem('amp_utm') || '{}'); } catch (x) { utm = {}; }
		var body = { source: document.title || 'site', name: d.name, phone: d.phone, email: d.email || '', message: d.message || '', consent: 'sim' };
		Object.keys(utm).forEach(function (k) { if (/^utm_/.test(k)) { body[k] = utm[k]; } });
		var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
		fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) {
			if (!r.ok) { throw 0; }
			var t = box.getAttribute('data-thanks');
			if (t) { location.href = t + (t.indexOf('?') < 0 ? location.search : ''); } else { say('Recebemos os seus dados. Obrigado!', false); f.reset(); btn.disabled = false; }
		}).catch(function () { btn.disabled = false; say('Não foi possível enviar. Tente pelo WhatsApp.', true); });
	});
})();
`;
WPT.css = String.raw`
:root{--a:__ACCENT__;--bg:__BG__;--fg:__FG__;--soft:__SOFT__;--line:__LINE__;--mut:__MUT__}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 '__BODY__',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'__HEAD__',sans-serif;line-height:1.15}
img{max-width:100%;height:auto}
a{color:var(--a)}
.w{max-width:1120px;margin:0 auto;padding:0 20px}
.amp-btn,.amp-form button{display:inline-block;background:var(--a);color:#fff;border:0;border-radius:10px;padding:13px 24px;font:700 16px/1.2 inherit;text-decoration:none;cursor:pointer}
.amp-btn:hover,.amp-form button:hover{filter:brightness(.92)}
.sh{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:1px solid var(--line)}
.admin-bar .sh{top:32px}
.sh-in{display:flex;align-items:center;justify-content:space-between;height:68px;gap:16px}
.sh-brand{font-weight:800;font-size:19px;color:var(--fg);text-decoration:none;font-family:'__HEAD__',sans-serif}
.sh-brand img{max-height:46px;width:auto}
.sh-nav{display:flex;align-items:center;gap:22px}
.sh-menu,.sf-menu{list-style:none;margin:0;padding:0;display:flex;gap:22px;align-items:center}
.sh-nav a{color:var(--fg);text-decoration:none;font-size:15px;font-weight:600}
.sh-nav a:hover,.sh-menu .current-menu-item>a{color:var(--a)}
.sh-nav .sh-cta{color:#fff;padding:10px 18px}
.mn-i,.mn-b{display:none}
.sf{background:var(--soft);border-top:1px solid var(--line);padding:40px 0 18px;font-size:14px}
.sf-g{display:grid;grid-template-columns:2fr 1fr 1.4fr;gap:28px}
.sf-g p{color:var(--mut);margin:6px 0 0}
.sf-menu{flex-direction:column;align-items:flex-start;gap:6px}
.sf a{color:var(--fg);text-decoration:none}
.sf-c{margin-top:26px;color:var(--mut);font-size:12.5px;border-top:1px solid var(--line);padding-top:14px}
.wa-fab{position:fixed;right:18px;bottom:18px;width:56px;height:56px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.25);z-index:70}
.amp-form{max-width:520px}
.amp-form form{display:grid;gap:10px}
.amp-form input[type=text],.amp-form input[type=tel],.amp-form input[type=email]{width:100%;border:1.5px solid var(--line);border-radius:10px;padding:13px 14px;font:inherit;background:#fff;color:#141414}
.amp-form .amp-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.amp-consent{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--mut)}
.amp-msg{margin:0;font-size:14px;color:#176b30}.amp-msg.bad{color:#b3472f}
.amp-thx{text-align:center;padding:90px 20px;min-height:60vh}
.amp-ck{width:72px;height:72px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-size:36px;margin:0 auto 18px}
.amp-blog{padding:40px 20px}
@media(max-width:760px){
.mn-b{display:flex;flex-direction:column;gap:4px;cursor:pointer;padding:8px}
.mn-b i{width:22px;height:2px;background:var(--fg);display:block}
.sh-nav{display:none;position:absolute;left:0;right:0;top:68px;background:var(--bg);flex-direction:column;align-items:stretch;padding:12px 22px 18px;border-bottom:1px solid var(--line);gap:12px}
.sh-menu{flex-direction:column;align-items:flex-start;gap:12px}
.mn-i:checked~.sh-nav{display:flex}
.sf-g{grid-template-columns:1fr}
}
`;
WPT.readme = String.raw`# __NAME__ · tema do WordPress

Gerado pelo Ampliação Studio em __DATE__. As páginas do site viram páginas do WordPress **editáveis no Elementor**.

## Como instalar
1. No WordPress: **Plugins → Adicionar novo** e instale e ative o **Elementor** (gratuito).
2. Instale os plugins que acompanham este pacote (pasta ` + "`plugins`" + String.raw`, se houver): **Plugins → Adicionar novo → Enviar plugin**.
3. **Aparência → Temas → Adicionar novo → Enviar tema** e escolha o arquivo ` + "`__SLUG__.zip`" + String.raw`. Clique em **Ativar**.
4. Ao ativar, o tema cria sozinho: as **páginas** (__PAGES__), o **menu**, a **página inicial** e a página **Obrigado**.
5. Abra qualquer página e clique em **Editar com Elementor**.

## Ajustes depois de ativar (Aparência → Personalizar)
- **Marca e contato:** nome, botão do cabeçalho, rodapé, WhatsApp, política de privacidade.
- **Captura de leads:** o endereço de captura do Studio (já vem preenchido se estava em Configurações) e a página de obrigado.
- **Rastreamento:** Pixel da Meta e Google Analytics 4. A conversão (Lead) dispara na página Obrigado.

## O formulário
O formulário das páginas é o shortcode ` + "`[amp_lead_form]`" + String.raw`. Ele envia nome, WhatsApp, e-mail e a origem (UTM) para o Studio, que distribui para e-mail, planilha, CRM e WhatsApp do vendedor. Depois do envio, a pessoa vai para a página Obrigado.

## Se alguma coisa não aparecer
- **Aparência → Páginas do Studio:** recria as páginas que faltam ou refaz todas (apaga as edições).
- Manualmente: **Elementor → Modelos → Importar** e use os arquivos da pasta ` + "`elementor-templates`" + String.raw` deste pacote (as imagens apontam para ` + "`/wp-content/themes/__SLUG__/assets/img/`" + String.raw`).

## Observações
- Este tema não depende de nenhum plugin pago. O formulário e o rastreamento são do próprio tema.
- Seções importadas de templates de terceiros viram blocos de HTML dentro do Elementor (editáveis como HTML).
- Teste a página inicial em celular e computador antes de publicar.
`;
