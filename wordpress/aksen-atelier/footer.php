<?php
/**
 * Aksen Atelier footer.
 * Patch: social profiles in the global footer; accessible Google reviews and
 * lightweight Instagram links only on the front page.
 *
 * Note: this file is a staging deployment candidate, not a live-site edit.
 */
?>
<?php if ( is_front_page() ) : ?>
  <?php get_template_part( 'partials/social-proof' ); ?>
<?php endif; ?>
</main>
<footer class="ap-footer">
  <div class="ap-container ap-footer__top">
    <div class="ap-footer__brand">
      <a class="ap-footer__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">AKSEN <span>PHOTO</span></a>
      <p>Fotografia ślubna, rodzinna i reportażowa w Szczecinie i okolicach.</p>
      <?php
      $aksen_social_profiles = [
        'Instagram' => 'https://www.instagram.com/aksen_photo/',
        'Facebook'  => 'https://www.facebook.com/369942623632492/',
        'TikTok'    => 'https://www.tiktok.com/@aksen_photo',
        'Pinterest' => 'https://www.pinterest.com/Aksen_Photo/',
        'YouTube'   => 'https://www.youtube.com/channel/UCCDQ1eowe3g53RJvYJnKYyQ',
      ];
      ?>
      <nav class="ap-social-links" aria-label="Aksen Photo w mediach społecznościowych">
        <?php foreach ( $aksen_social_profiles as $platform => $profile_url ) : ?>
          <a href="<?php echo esc_url( $profile_url ); ?>"
             target="_blank" rel="noopener noreferrer me"
             aria-label="<?php echo esc_attr( 'Aksen Photo na ' . $platform . ' (nowa karta)' ); ?>"><?php echo esc_html( $platform ); ?></a>
        <?php endforeach; ?>
      </nav>
      <a class="ap-google-footer" href="https://www.google.com/maps/search/?api=1&amp;query=Fotograf%20Aksen%20Photo%20Szczecin&amp;query_place_id=ChIJfUfo0vgPqkcRtEMtsG0bWCc"
         target="_blank" rel="noopener noreferrer">Opinie w Google <span aria-hidden="true">↗</span></a>
    </div>
    <div><h3>Fotografia</h3>
      <a href="<?php echo esc_url( aksen_atelier_url( 'portfolio-slubne-aksen-photo-fotograf-slubny' ) ); ?>">Śluby i wesela</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotograf-na-chrzest-swiety-szczecin' ) ); ?>">Chrzty św.</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotograf-na-18-urodziny-w-szczecinie' ) ); ?>">Urodziny</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotograf-na-komunie-szczecin' ) ); ?>">Komunie św.</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotograf-na-studniowke-szczecin' ) ); ?>">Studniówki</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotografia-wizerunkowa-i-biznesowa-szczecin' ) ); ?>">Sesje biznesowe</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotografia-rodzinna-szczecin-zdjecia-rodzinne' ) ); ?>">Sesje rodzinne</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'fotograf-na-eventy-i-reportaze-szczecin' ) ); ?>">Inne reportaże</a>
    </div>
    <div><h3>Aksen Photo</h3>
      <a href="<?php echo esc_url( aksen_atelier_url( 'o-mnie-fotograf-szczecin' ) ); ?>">O mnie</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'blog-fotograficzny' ) ); ?>">Blog</a>
      <a href="<?php echo esc_url( aksen_atelier_contact_url() ); ?>">Kontakt</a>
      <a href="<?php echo esc_url( aksen_atelier_url( 'polityka-prywatnosci-plikow-cookies-fotografa' ) ); ?>">Prywatność i regulamin</a>
    </div>
    <div><h3>Kontakt</h3>
      <a class="ap-footer__contact" href="tel:+48518202089">+48 518 202 089</a>
      <a href="<?php echo esc_url( aksen_atelier_contact_url() ); ?>">Napisz wiadomość <span aria-hidden="true">↗</span></a>
      <p>Szczecin · Zachodniopomorskie</p>
    </div>
  </div>
  <div class="ap-container ap-footer__bottom"><span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> Aksen Photo</span><span>Fotograf Szczecin</span></div>
</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
